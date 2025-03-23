import { useState } from "react";
import "./Display.css";
const Display = ({ contract, account }) => {
  const [data, setData] = useState("");
  const getdata = async () => {
  let dataArray;
  const Otheraddress = document.querySelector(".address").value;
  try {
    if (Otheraddress) {
      dataArray = await contract.display(Otheraddress);
    } else {
      dataArray = await contract.display(account);
    }
    console.log("Fetched Data:", dataArray);
  } catch (e) {
    alert("You don't have access");
    return; // Exit the function early if there's an error
  }

  // ✅ Fix: Check if dataArray is undefined or null
  if (!dataArray || dataArray.length === 0) {
    alert("No image to display");
    return;
  }

  const str = dataArray.toString();
  const str_array = str.split(",");

  const images = str_array.map((item, i) => {
    return (
      <a href={item} key={i} target="_blank" rel="noreferrer">
        <img key={i} src={item} alt="File Uploaded" className="image-list"></img>
      </a>
    );
  });
  setData(images);
};

  return (
    <>
      <div className="image-list">{data}</div>
      <input
        type="text"
        placeholder="Enter Address"
        className="address"
      ></input>
      <button className="center button" onClick={getdata}>
        Get Data
      </button>
    </>
  );
};
export default Display;
