import React from "react";
import "./App.css";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { Bundler } from "bundlr-browser-client";
import { ethers, BigNumber } from "ethers";
const injected = new InjectedConnector({
  supportedChainIds: [137],
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    137: "https://polygon-rpc.com",
  },
});

function App() {
  const web3 = useWeb3React();
  const library = web3.library as ethers.providers.Web3Provider;
  const [maticBalance, setBalance] = React.useState<BigNumber>();
  const [img, setImg] = React.useState<Buffer>();
  const [price, setPrice] = React.useState<BigNumber>();
  const [bundler, setBundler] = React.useState<Bundler>();
  const connectWeb3 = async (
    connector: InjectedConnector | WalletConnectConnector
  ) => {
    try {
      await web3.activate(connector);
      console.log("connected to", web3.chainId);
      console.log(
        "current gas token balance",
        ethers.utils.formatEther(await library.getBalance(web3.account!))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const connectBundlr = async () => {
    const bundlr = new Bundler("https://node1.bundlr.network", web3.library);
    try {
      await bundlr.connect();
    } catch (err) {
      console.log(err);
    }
    console.log(bundlr);
    setBundler(bundlr);
  };
  const handleFileClick = () => {
    var fileInputEl = document.createElement("input");
    fileInputEl.type = "file";
    fileInputEl.accept = "image/*";
    fileInputEl.style.display = "none";
    document.body.appendChild(fileInputEl);
    fileInputEl.addEventListener("input", function (e) {
      handleUpload(e as any);
      document.body.removeChild(fileInputEl);
    });
    fileInputEl.click();
  };

  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    let files = evt.target.files;
    let reader = new FileReader();
    if (files && files.length > 0) {
      reader.onload = function () {
        if (reader.result) {
          setImg(Buffer.from(reader.result as ArrayBuffer));
        }
      };
      reader.readAsArrayBuffer(files[0]);
    }
  };

  const handlePrice = async () => {
    if (img) {
      const price = await bundler!.getPrice(img.length);
      setPrice(price);
    }
  };

  const uploadFile = async () => {
    if (img) {
      const res = await bundler!.uploadItem(img);
      console.log(res);
    }
  };

  const fundMatic = async () => {
    if (bundler) {
      const res = bundler.fundMatic(BigNumber.from(100000));
      console.log(res);
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => connectWeb3(injected)}>Connect Metamask</button>
        <button onClick={() => connectWeb3(walletconnect)}>
          Connect WalletConnect
        </button>
        <button onClick={connectBundlr}>Connect to Bundlr Network</button>
        {bundler && (
          <>
            <button
              onClick={() => {
                web3.account &&
                  bundler!
                    .getBundlrBalance(web3.account)
                    .then((res) => setBalance(res));
              }}
            >
              Get Matic Balance
            </button>
            <button onClick={fundMatic}>Fund Bundlr</button>
          </>
        )}
        <button onClick={handleFileClick}>Select file from Device</button>
        {img && (
          <>
            <button onClick={handlePrice}>Get Price</button>
            <button onClick={uploadFile}>Upload to Bundlr Network</button>
          </>
        )}
        <p>Account: {web3.account}</p>
        {maticBalance && (
          <p>Matic Balance: {ethers.utils.formatEther(maticBalance)}</p>
        )}
        {price && <p>Price to Upload: {ethers.utils.formatEther(price)}</p>}
      </header>
    </div>
  );
}

export default App;
