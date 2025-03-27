// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Upload {
  
  struct Access{
     address user; 
     bool access; //true or false
  }
  mapping(address=>string[]) value;
  mapping(address=>mapping(address=>bool)) ownership;
  mapping(address=>Access[]) accessList;
  mapping(address=>mapping(address=>bool)) previousData;
  
  // New mapping for image-specific permissions
  mapping(string => mapping(address => bool)) imagePermissions;

  function add(address _user,string memory url) external {
      value[_user].push(url);
  }
  
  function allow(address user) external {//def
      ownership[msg.sender][user]=true; 
      if(previousData[msg.sender][user]){
         for(uint i=0;i<accessList[msg.sender].length;i++){
             if(accessList[msg.sender][i].user==user){
                  accessList[msg.sender][i].access=true; 
             }
         }
      }else{
          accessList[msg.sender].push(Access(user,true));  
          previousData[msg.sender][user]=true;  
      }
  }
  
  function disallow(address user) public{
      ownership[msg.sender][user]=false;
      for(uint i=0;i<accessList[msg.sender].length;i++){
          if(accessList[msg.sender][i].user==user){ 
              accessList[msg.sender][i].access=false;  
          }
      }
  }

  // New function to grant access to a specific image
  function allowSpecificImage(address user, string memory imageUrl) external {
      require(msg.sender != user, "Cannot share with yourself");
      
      // Verify the image belongs to the sender
      bool ownsImage = false;
      for(uint i = 0; i < value[msg.sender].length; i++) {
          if(keccak256(bytes(value[msg.sender][i])) == keccak256(bytes(imageUrl))) {
              ownsImage = true;
              break;
          }
      }
      require(ownsImage, "You don't own this image");
      
      imagePermissions[imageUrl][user] = true;
  }
  
  // Function to grant access to multiple images at once
  function allowMultipleImages(address user, string[] memory imageUrls) external {
      require(msg.sender != user, "Cannot share with yourself");
      
      for(uint i = 0; i < imageUrls.length; i++) {
          string memory imageUrl = imageUrls[i];
          
          // Verify the image belongs to the sender (optional for gas optimization, can be removed)
          bool ownsImage = false;
          for(uint j = 0; j < value[msg.sender].length; j++) {
              if(keccak256(bytes(value[msg.sender][j])) == keccak256(bytes(imageUrl))) {
                  ownsImage = true;
                  break;
              }
          }
          
          if(ownsImage) {
              imagePermissions[imageUrl][user] = true;
          }
      }
  }
  
  // Function to revoke access to a specific image
  function revokeImageAccess(address user, string memory imageUrl) external {
      require(msg.sender != user, "Cannot revoke from yourself");
      imagePermissions[imageUrl][user] = false;
  }

  function display(address _user) external view returns(string[] memory){
      require(_user==msg.sender || ownership[_user][msg.sender],"You don't have access");
      return value[_user];
  }
  
  // New function to display specific images a user has access to
  function displayAccessibleImages(address _owner) external view returns (string[] memory) {
      string[] memory allImages = value[_owner];
      
      // First count how many images are accessible
      uint accessibleCount = 0;
      for(uint i = 0; i < allImages.length; i++) {
          if(_owner == msg.sender || ownership[_owner][msg.sender] || imagePermissions[allImages[i]][msg.sender]) {
              accessibleCount++;
          }
      }
      
      // Create array of correct size
      string[] memory accessibleImages = new string[](accessibleCount);
      
      // Fill the array with accessible images
      uint currentIndex = 0;
      for(uint i = 0; i < allImages.length; i++) {
          if(_owner == msg.sender || ownership[_owner][msg.sender] || imagePermissions[allImages[i]][msg.sender]) {
              accessibleImages[currentIndex] = allImages[i];
              currentIndex++;
          }
      }
      
      return accessibleImages;
  }

  function shareAccess() public view returns(Access[] memory){
      return accessList[msg.sender];
  }
  
  // Function to check if user has access to a specific image
  function hasImageAccess(address _owner, string memory imageUrl, address _viewer) external view returns (bool) {
      return (_owner == _viewer || ownership[_owner][_viewer] || imagePermissions[imageUrl][_viewer]);
  }
}