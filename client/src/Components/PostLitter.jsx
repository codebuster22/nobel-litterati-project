/*
  Form to upload litter image and destroy it.
 */

import React, {useState} from 'react';
import ipfsClient from 'ipfs-http-client';
const ipfs = ipfsClient('https://ipfs.infura.io:5001');

const PostLitter = ({postLitterOnContract, isRegistered}) => {

    const DESTROY_LITTER = "Destroy Litter!";
    const SORTING = "Sorting....";
    const DESTROYING = "Destroying....";
  
    const [imageLoaded, setImageLoaded] = useState(false);
    const [file, setFile] = useState();
    const [previewImage, setPreviewImage] = useState();
    const [caption, setCaption] = useState();
    const [postingState, setPostingState] = useState(DESTROY_LITTER)
  
    const handleCaptionChange = (event) => {
      if(event.target.value!==null){
        setCaption(event.target.value);
      }
    }
  
    const handleInputFile = async  (event) => {
      if( event.target.files && event.target.files[0] ){
        const file = event.target.files[0];
        setPreviewImage(URL.createObjectURL(file));
        setImageLoaded(true);
        setPostingState(SORTING);
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
          setPostingState(DESTROY_LITTER);
          setFile(Buffer(reader.result));
        }
      }
    }
  
    const handleDestroyLitter = async () => {
      if(postingState!==DESTROY_LITTER) return;
      if(file===null) return;
      setPostingState(DESTROYING)
      console.log(file);
      const result = await ipfs.add(file);
      console.log(result);
      const flag = await postLitterOnContract(
                                          result.path, caption || 'Awesome'
                                          )
      if(!flag) { alert("Destroying Failed"); return; }
      alert("Destroyed Successfully");
      setPostingState(DESTROY_LITTER);
    }
  
  
    return (
            <div className={'col-12 col-md-6 post-litter'} >
              <form >
                <div className={'custom-file mt-5 mb-3'}>
                  <input 
                      type={'file'} 
                      onChange={handleInputFile}
                      placeholder={"Upload the litter"} 
                      className={'upload-litter custom-file-input'} 
                      id={'customFile'} 
                    />
                  <label 
                      className={'custom-file-label'}
                      htmlFor={'customFile'}
                      >
                        Pick Up Litter...
                    </label>
                </div>
                <div className={"form-group mt-1 mb-3"}>
                  <label htmlFor="exampleFormControlInput1">Something About Litter</label>
                  <input type={"text"} onChange={handleCaptionChange} value={caption} className={"form-control"} id={"exampleFormControlInput1"} placeholder={"Worst"} />
                </div>
                {
                  imageLoaded?
                      <div className={'litter-preview-container mt-3 mb-3 p-2'}>
                        <img src={previewImage} alt={'litter-preview'} className={'LitterPreview'} />
                      </div>
                      :
                      <></>
                }
                <div>
                  <button type={'button'} onClick={handleDestroyLitter} className={'btn btn-danger mt-3 mb-3'} >
                    {postingState}
                  </button>
                </div>
              </form>
            </div>
    )
  
}

export default PostLitter;