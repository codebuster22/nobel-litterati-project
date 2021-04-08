/*
  Component to render and 
  show litters fetched from blockchain
 */

import React, {useState} from 'react';

const ViewLitters = ({litters, giftReward}) => {

    const renderLitters = (litters) =>
          litters.map(
              litter => <LitterCard litter={litter} key={litter.tokenId} giftReward={giftReward} />
            )
  
    return (
            <div className={'col-12 col-md-6 pt-5 view-litters'} >
              <h2>
                Litters by the community
              </h2>
              <div className={'mt-5 mb-5 p-2'}>
                  {renderLitters(litters)}
              </div>
            </div>
    )
  
}

export default ViewLitters;
  
  const LitterCard = ({litter, giftReward}) => {
  
    const [isGifting, setIsGifting] = useState(false);
  
    const giveReward = async () => {
      setIsGifting(true);
      alert(`Are you sure you want to gift ${litter.creator}, 1 Nobel Token`);
      const flag = await giftReward(litter.creator);
      if(!flag){
        alert("Sending Reward Failed");
        return;
      }
      alert("Sent");
      setIsGifting(false)
    }
  
    return (
            <div className={'w-100 d-flex justify-content-center'}>
              <div className={"card mt-2 mb-2"} style={{width: '20rem'}}>
                    <img src={`https://ipfs.infura.io/ipfs/${litter.tokenUri}`} className="card-img-top" alt="..." />
                    <div className="card-body">
                      <h5 className="card-title">{litter.creatorName}</h5>
                      <p className="card-body">{litter.caption}</p>
                      <button type={'button'} className="btn btn-primary" onClick={giveReward} >
                        {
                          isGifting?
                            "Sending...."
                            :
                            "Give 1 Nobel Token as Reward"
                        }
                      </button>
                    </div>
              </div>
            </div>
    )
  
  
  }