// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function App() {
  const createURL='https://mlh1gqdtu0.execute-api.us-east-1.amazonaws.com/temp/create'
  const updateURL='https://mlh1gqdtu0.execute-api.us-east-1.amazonaws.com/temp/update'
  const readURL='https://mlh1gqdtu0.execute-api.us-east-1.amazonaws.com/temp/read'
  const deleteURL='https://mlh1gqdtu0.execute-api.us-east-1.amazonaws.com/temp/delete'
  const [batches, setBatches] = useState([]);
  const [batchDetails, setBatchDetails] = useState({
    batchID: '',
    DeliveryAddress: '',
    ProductName: '',
    ProductQuantity: '',
    batchStage: 'Production',
  });
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [deleteModalIsOpen,setDeleteModal] = useState(false);
  const [createModalIsOpen,setCreateModal] = useState(false);
  
  const createBatch = async () => {
    
    try {
      // Invoke the Create Batch API
      let newbatch={
        batchID: document.getElementById('newbatchID').value,
        DeliveryAddress: document.getElementById('DAddress').value,
        ProductName: document.getElementById('PName').value,
        ProductQuantity: document.getElementById('PQuantity').value,
        batchStage: 'Production'
      }
      console.log(newbatch);
      if(!batches.includes(newbatch.batchID)){
      const response = await fetch(createURL, {
        method: 'POST',
        body: JSON.stringify(newbatch),
        headers: {
          'Content-Type': 'application/json',
        },
      });
        
      
      // Handle response (e.g., show success message)
      let data = await response.json();
      console.log(data);
      alert("Batch Created Successfully\nThe document Id for the operation is: "+data.body.result[0].documentId)
      document.getElementById('newbatchID').value = ''
      document.getElementById('DAddress').value = ''
      document.getElementById('PName').value = ''
      document.getElementById('PQuantity').value = ''
        searchBatch();
      }
      else{
        alert("Batch Already Exists")
        document.getElementById('newbatchID').value = ''
        document.getElementById('DAddress').value = ''
        document.getElementById('PName').value = ''
        document.getElementById('PQuantity').value = ''
      }
    
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const searchBatch = async () => {
    try {
      // Invoke the Read Batches API
      console.log('Searching for batch...');
      let userInput = document.getElementById('batchIdInput').value;
      if (userInput === '') {
        const response = await fetch(readURL);
        const data = await response.json();
        let retrieved=data.body.result
        setBatches(data.body.result);
      }
      else {
        
        let fetchURL=readURL+'?batchID='+userInput
        console.log(fetchURL);
        const response = await fetch(fetchURL);
        const data = await response.json();
        let retrieved=data.body.result
        setBatches(data.body.result);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };
  const handleChangeStage = async() => {
      let newstage=getNextStage(selectedBatch.batchStage)
      let obj={
        batchID:selectedBatch.batchID,
        batchStage:newstage
      }
      let response = await fetch(updateURL,{
        method:'PUT',
        body:JSON.stringify(obj),
        headers: {
          'Content-Type': 'application/json',
        },
      }) 
        
        setIsOpen(false);
     };
  const handleDelete = async() => {
    try {
      // Invoke the Delete Batch API
      
      let DeleteURL=deleteURL+'?batchID='+selectedBatch.batchID;
      const response = await fetch(DeleteURL,{
        method:'DELETE',
        headers:
           {
             'Content-Type': 'application/json',
           },
      
      });
  } catch (error) {
      console.error('Error deleting batch:', error);
    }
    setDeleteModal(false);
  };
  const getNextStage = (currentStage) => {
   const stages = ['Production', 'Produced', 'Shipped', 'Delivered'];
   const currentStageIndex = stages.indexOf(currentStage);
   const newStageIndex = (currentStageIndex + 1) % stages.length;
   return stages[newStageIndex];
  };
  useEffect(() => {
    searchBatch();
  }, [modalIsOpen,deleteModalIsOpen]);

  return (
    <div className="App">
      <label>Batch ID : </label>
      <input type="text" id="newbatchID"/><br></br>

      <label>Delivery Address : </label>
      <input type="text" id="DAddress"/> <br></br>
      <label>Product Name : </label>
      <input type="text" id="PName"/> <br></br>
      <label>Product Quantity : </label>
      <input type="text" id="PQuantity"/><br></br>
      <button onClick={createBatch}>Create Batch</button> <br></br>
      {/* Add modal for batch details input */}
      <input type="text" placeholder="Search by Batch ID" id="batchIdInput" onChange={searchBatch} />
      {/* <button onClick={() => searchBatch()}>Search</button> */}
      
      <table>
        <thead>
           <tr>
             <th>Batch ID</th>
             <th>Delivery Address</th>
             <th>Product Name</th>
             <th>Product Quantity</th>
             <th>Batch Stage</th>
             <th>Actions</th>
           </tr>
         </thead>
         <tbody>
           {batches.map((batch) => (
             <tr key={batch.batchID}>
               <td>{batch.batchID}</td>
               <td>{batch.DeliveryAddress}</td>
               <td>{batch.ProductName}</td>
               <td>{batch.ProductQuantity}</td>
               <td>{batch.batchStage}</td>
               <td>
                 {batch.batchStage!="Delivered" && <button onClick={()=>{ setSelectedBatch(batch); setIsOpen(true); }}>Update Stage</button>}
                 <button onClick={()=>{
                      setSelectedBatch(batch); setDeleteModal(true);
                 }}>Delete Batch</button>
               </td>
             </tr>
           ))}
         </tbody>
      </table>
      
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Change Stage Modal"
      >
        <h2>Change Stage</h2>
        <p>Are you sure you want to change the stage of batch {selectedBatch && selectedBatch.batchID} from {selectedBatch && selectedBatch.batchStage} to {selectedBatch && getNextStage(selectedBatch.batchStage)}?</p>
        <div id="ModalDivButton">
        <button onClick={handleChangeStage}>Yes</button>
        <button onClick={() => setIsOpen(false)}>No</button>
          </div>
          
      </Modal>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={() => setDeleteModal(false)}
        contentLabel="Delete Batch"
      >
        <h2>Delete Batch</h2>
        <p>Are you sure you want to delete batch {selectedBatch && selectedBatch.batchID}?</p>
        <div id="ModalDivbutton">
        <button onClick={handleDelete}>Yes</button>
        <button onClick={() => setDeleteModal(false)}>No</button>
        </div>
      </Modal>
      </div>
  );
}

export default App;
