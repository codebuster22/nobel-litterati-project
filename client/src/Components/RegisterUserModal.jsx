/*
Modal that pops out for new User 
or user who are not registered 
to help them register
 */

import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';

const RegisterUserModal = ({show, onHide, register}) => {
  
    const [isRegistering, setIsRegistering] = useState(false);
    const [userName, setUserName] = useState('')
  
    const registerUser = async () => {
      setIsRegistering(true);
      const flag = await register(userName);
      if(flag){
        alert('Success');
        setIsRegistering(false);
        onHide();
      }else {
        alert('Failed');
        setIsRegistering(false);
      }
    }
  
    return (
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Register here!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>You are not registered, register here!</h6>
          <div className={'form-group mt-4'}>
            <label htmlFor={'usernameInput'}>
              User Name
            </label>
            <input value={userName} onChange={(e)=>setUserName(e.target.value)} className={'form-control'} id={'usernameInput'} type={'text'} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className={'btn btn-primary'} onClick={registerUser}>
            {
              isRegistering?'Registering...':'Register'
            }
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  export default RegisterUserModal;