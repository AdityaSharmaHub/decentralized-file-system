import React, { useEffect, useState } from "react";
import "./Modal.css";

const Modal = ({ setModalOpen, contract, account }) => {
  const [userImages, setUserImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sharingMode, setSharingMode] = useState("all"); // "all" or "selective"

  // Load user's images
  useEffect(() => {
    const loadImages = async () => {
      if (contract && account) {
        try {
          const images = await contract.display(account);
          setUserImages(Array.isArray(images) ? images : []);
        } catch (error) {
          console.error("Error loading images:", error);
        }
      }
    };

    loadImages();
  }, [contract, account]);

  // Load users with access
  useEffect(() => {
    const accessList = async () => {
      if (!contract) return;
      
      try {
        const addressList = await contract.shareAccess();
        let select = document.querySelector("#selectNumber");
        
        // Clear existing options except the first one
        while (select.options.length > 1) {
          select.remove(1);
        }
        
        // Add users with access
        for (let i = 0; i < addressList.length; i++) {
          if (addressList[i].access) {
            let opt = addressList[i].user;
            let el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
          }
        }
      } catch (error) {
        console.error("Error loading access list:", error);
      }
    };
    
    contract && accessList();
  }, [contract]);

  // Share all images
  const shareAllImages = async () => {
    if (!recipientAddress) {
      alert("Please enter a recipient address");
      return;
    }

    try {
      await contract.allow(recipientAddress);
      alert("Access granted successfully!");
      setModalOpen(false);
    } catch (error) {
      console.error("Error sharing access:", error);
      alert("Error sharing access. See console for details.");
    }
  };

  // Share selected images
  const shareSelectedImages = async () => {
    if (!recipientAddress) {
      alert("Please enter a recipient address");
      return;
    }

    if (selectedImages.length === 0) {
      alert("Please select at least one image to share");
      return;
    }

    try {
      await contract.allowMultipleImages(recipientAddress, selectedImages);
      alert("Images shared successfully!");
      setModalOpen(false);
    } catch (error) {
      console.error("Error sharing images:", error);
      alert("Error sharing images. See console for details.");
    }
  };

  // Toggle image selection
  const toggleImageSelection = (imageUrl) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  // Handle sharing based on mode
  const handleShare = () => {
    if (sharingMode === "all") {
      shareAllImages();
    } else {
      shareSelectedImages();
    }
  };

  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <div className="title">Share Images</div>
        
        <div className="sharing-mode">
          <label>
            <input
              type="radio"
              name="sharingMode"
              value="all"
              checked={sharingMode === "all"}
              onChange={() => setSharingMode("all")}
            />
            Share All Images
          </label>
          <label>
            <input
              type="radio"
              name="sharingMode"
              value="selective"
              checked={sharingMode === "selective"}
              onChange={() => setSharingMode("selective")}
            />
            Share Selected Images
          </label>
        </div>
        
        <div className="body">
          <input
            type="text"
            className="address"
            placeholder="Enter Recipient Address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
        
        {sharingMode === "selective" && (
          <div className="image-selection-container">
            <h4>Select Images to Share:</h4>
            <div className="image-grid">
              {userImages.length > 0 ? (
                userImages.map((url, index) => (
                  <div key={index} className="image-selection-item">
                    <img src={url} alt={`User upload ${index}`} />
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(url)}
                      onChange={() => toggleImageSelection(url)}
                    />
                  </div>
                ))
              ) : (
                <p>No images available to share</p>
              )}
            </div>
          </div>
        )}
        
        <form id="myForm">
          <select id="selectNumber">
            <option className="address">People With Access</option>
          </select>
        </form>
        
        <div className="footer">
          <button
            onClick={() => setModalOpen(false)}
            id="cancelBtn"
          >
            Cancel
          </button>
          <button onClick={handleShare}>Share</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;