import React, { Component } from "react";
import Home from "./ui/ui";
import "./App.css";
import {
  Button,
  Menu,
  Divider,
  BackTop,
  Image,
  Input,
  Card,
  Descriptions,
} from "antd";
import "antd/dist/antd.css";
import {
  HomeOutlined,
  SettingFilled,
  ShopOutlined,
  SendOutlined,
  StarOutlined,
  UploadOutlined,
  SketchOutlined,
  SketchCircleFilled,
  FieldTimeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {contractNFTFactoryInstance, contractAuctionInstance} from "./eth/auction"
// const ipfsAPI = require("ipfs-api");
// const ipfs = ipfsAPI({ host: "https://ipfs.infura.io", port: "5001", protocol: "https" });

const ipfsClient = require("ipfs-http-client");
const projectId = "2T3Zx5gaSCdLkwoBqHiztEVpfPA";
const projectSecret = "3597faaa0297b05d8ad41ab87a65d451";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const client = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const { Meta } = Card;

let web3 = require("./util/initWeb3");

// let NFTinstance = require("./eth/auctionNFT");

/**
 * use following commands to configure ipfs
 * ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[\"*\"]'
 * ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '[\"PUT\", \"GET\", \"POST\"]'
 */
let saveImageOnIpfs = (reader) => {
  return new Promise(function (resolve, reject) {
    const buffer = Buffer.from(reader.result);

    client.add(buffer).then((res) => {
      resolve(res.path);
    }).catch((err) => {
      reject(err)
    });
  });
};

class App extends Component {
  //pass to ui props
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      balance: null,
      imgSrc: null,

      price: null,
      time: null,

      isShowMintNFT: false,

      isShowMyNFT: false,
      showMyNFT_num: 0,
      showMyNFT_IDs: null,
      showMyNFT_URIs: null,
      showMyNFT_isAuctioned: null,

      isShowMyOngoingNFT: false,
      showMyOngingNFT_num: 0,
      showMyOngingNFT_URIs: null,
      showMyOngingNFT_start_prices: null,
      showMyOngingNFT_highest_prices: null,
      showMyOngingNFT_end_times: null,
      showMyOngingNFT_is_endeds: null,
      showMyOngingNFT_auctionIDs: null,

      isShowNFTMarket: false,
      showMarketNFT_num: 0,
      showMarketNFT_URIs: null,
      showMarketNFT_start_prices: null,
      showMarketNFT_highest_prices: null,
      showMarketNFT_end_times: null,
      showMarketNFT_is_endeds: null,
      showMarketNFT_auctionIDs: null,

      isShowHistory: false,
      NFTHistory: null,
      history: null,

      isShowBuyNFT: false,
      showBuyNFT_price: null,
      showBuyNFT_URI: null,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let target = event.target;
    if (target.id === "price") {
      this.setState({ price: target.value });
    }
    if (target.id === "time") {
      this.setState({ time: target.value });
    }
  }

  componentDidMount() {}

  async componentWillMount() {
    this.loadBlockchainData();
  }

  accountInterval = setInterval(async () => {
    let accounts = await web3.eth.getAccounts();
    if (accounts[0] !== this.state.account && typeof accounts[0] != undefined) {
      // window.location.reload();
      this.resetAll();
      await this.loadBlockchainData();
    }
  }, 300);

  //TODO:切换账户不会刷新，如果切换后直接mint，会提示需要账户信息
  async loadBlockchainData() {
    let accounts = await web3.eth.getAccounts();
    let Balance = await web3.eth.getBalance(accounts[0]);
    let balance = await web3.utils.fromWei(Balance, "ether");

    let showMyNFTRes = await contractAuctionInstance.methods
      .showMyNFT(accounts[0])
      .call();
    let showMyNFTIds = showMyNFTRes[1];
    let showMyNFTURIs = showMyNFTRes[2];
    let showMyNFTnum = parseInt(showMyNFTRes[0]);
    let showMyNFTIsAuctioned = showMyNFTRes[3];

    let isShowMyOngoingNFTRes1 = await contractAuctionInstance.methods
      .viewMyAllAuction_URI_price(accounts[0])
      .call();
    let isShowMyOngoingNFTRes2 = await contractAuctionInstance.methods
      .viewMyAllAuction_time_isended_auctionID(accounts[0])
      .call();
      console.log("end time", isShowMyOngoingNFTRes2)
    let showMyOngingNFTURIs = isShowMyOngoingNFTRes1[0];
    let showMyOngingNFTnums = showMyOngingNFTURIs.length;
    let showMyOngingNFTstart_prices = isShowMyOngoingNFTRes1[1];
    let showMyOngingNFThighest_prices = isShowMyOngoingNFTRes1[2];
    let showMyOngingNFTendTimes = isShowMyOngoingNFTRes2[0];
    let showMyOngingNFTisendeds = isShowMyOngoingNFTRes2[1];
    let showMyOngingNFTauctionIDs = isShowMyOngoingNFTRes2[2];

    let isShowMarketNFTRes1 = await contractAuctionInstance.methods
      .viewAllAuction_URI_price()
      .call();
    let isShowMarketNFTRes2 = await contractAuctionInstance.methods
      .viewAllAuction_time_isended_auctionID()
      .call();
    let showMarketNFTURIs = isShowMarketNFTRes1[0];
    let showMarketNFTnums = showMarketNFTURIs.length;
    let showMarketNFTstart_prices = isShowMarketNFTRes1[1];
    let showMarketNFThighest_prices = isShowMarketNFTRes1[2];
    let showMarketNFTendTimes = isShowMarketNFTRes2[0];
    let showMarketNFTisendeds = isShowMarketNFTRes2[1];
    let showMarketNFTauctionIDs = isShowMarketNFTRes2[2];

    let NFTHistory = [];
    let res;
    for (let i = 0; i < showMarketNFTauctionIDs.length; i++) {
      res = await contractAuctionInstance.methods
        .traceNFTHistory(showMarketNFTauctionIDs[i])
        .call();
      NFTHistory.push(res);
    }

    let resBuy = await contractAuctionInstance.methods
      .showBoughtNFT(accounts[0])
      .call();
    let showBuyNFT_price = resBuy[0];
    let showBuyNFT_URI = resBuy[1];

    this.setState({
      account: accounts[0],
      balance: balance,

      showMyNFT_num: showMyNFTnum,
      showMyNFT_IDs: showMyNFTIds,
      showMyNFT_URIs: showMyNFTURIs,
      showMyNFT_isAuctioned: showMyNFTIsAuctioned,

      showMyOngingNFT_num: showMyOngingNFTnums,
      showMyOngingNFT_URIs: showMyOngingNFTURIs,
      showMyOngingNFT_auctionIDs: showMyOngingNFTauctionIDs,
      showMyOngingNFT_end_times: showMyOngingNFTendTimes,
      showMyOngingNFT_highest_prices: showMyOngingNFThighest_prices,
      showMyOngingNFT_is_endeds: showMyOngingNFTisendeds,
      showMyOngingNFT_start_prices: showMyOngingNFTstart_prices,

      showMarketNFT_num: showMarketNFTnums,
      showMarketNFT_URIs: showMarketNFTURIs,
      showMarketNFT_auctionIDs: showMarketNFTauctionIDs,
      showMarketNFT_end_times: showMarketNFTendTimes,
      showMarketNFT_highest_prices: showMarketNFThighest_prices,
      showMarketNFT_is_endeds: showMarketNFTisendeds,
      showMarketNFT_start_prices: showMarketNFTstart_prices,

      NFTHistory: NFTHistory,

      showBuyNFT_URI: showBuyNFT_URI,
      showBuyNFT_price: showBuyNFT_price,
    });
  }

  resetAll = () => {
    this.setState({
      isShowMintNFT: false,
      isShowMyNFT: false,
      isShowMyOngoingNFT: false,
      isShowNFTMarket: false,
      isShowHistory: false,
      isShowBuyNFT: false,
    });
  };

  mintNFT = async () => {
    try {
      //TODO:没有启动私链的话会永久等待，应该报错，怎么解决
      await contractNFTFactoryInstance.methods
        .awardItem(this.state.account, this.state.imgSrc)
        .send({ from: this.state.account, gas: "3000000" });
      alert("mint success!");
      this.resetAll();
      await this.loadBlockchainData();
      this.setState({ isShowMintNFT: true });
    } catch (e) {
      console.log(e);
      alert("mint fail!");
    }
  };

  createAuction = async (term, e) => {
    e.preventDefault();
    let price = this.state.price;
    let time = this.state.time;
    console.log(price, time);
    price = web3.utils.toWei(price, "ether");
    try {
      await contractAuctionInstance.methods
        .createAuction(term.NFT_ID, price, time)
        .send({ from: this.state.account, gas: "3000000" });
      alert("create auction success!");
      this.resetAll();
      await this.loadBlockchainData();
      this.setState({ isShowMyNFT: true });
    } catch (e) {
      console.log(e);
      alert("create auction fail!");
    }
  };

  showMyNFT = () => {
    let res = [];
    for (let i = this.state.showMyNFT_num - 1; i >= 0; i--) {
      res.push({
        NFT_ID: this.state.showMyNFT_IDs[i],
        URI: this.state.showMyNFT_URIs[i],
        isAuctioned: this.state.showMyNFT_isAuctioned[i],
      });
    }
    console.log(res);

    return (
      <div>
        <Card>
          {res.map((term) => (
            <div>
              <Image
                height={180}
                alt="NFT"
                src={"https://ipfs.io/ipfs/" + term.URI}
              />
              {!term.isAuctioned ? (
                <form onSubmit={this.createAuction.bind(this, term)}>
                  <label>
                    Start Price:
                    <Input
                      style={{ width: 180 }}
                      prefix={<SketchCircleFilled />}
                      suffix="ETH"
                      size="large"
                      id="price"
                      type="number"
                      step="0.000000000000000001"
                      name="price"
                      onChange={this.handleChange}
                      ref={(input) => {
                        this.start_price = input;
                      }}
                    />
                  </label>
                  <br />
                  <label>
                    Duration:
                    <Input
                      style={{ width: 180 }}
                      prefix={<FieldTimeOutlined />}
                      size="large"
                      suffix="seconds"
                      id="time"
                      type="number"
                      step="0.01"
                      name="time"
                      onChange={this.handleChange}
                      ref={(input) => {
                        this.time = input;
                      }}
                    />
                  </label>
                  <br />
                  <p>
                    <input type="submit" value="Create Auction" />
                  </p>
                </form>
              ) : null}
              <Divider />
            </div>
          ))}
        </Card>
      </div>
    );
  };

  showMyOngingNFT = () => {
    let res = [];

    for (let i = this.state.showMyOngingNFT_num - 1; i >= 0; i--) {
      res.push({
        URI: this.state.showMyOngingNFT_URIs[i],
        start_price: this.state.showMyOngingNFT_start_prices[i],
        highest_price: this.state.showMyOngingNFT_highest_prices[i],
        is_ended: this.state.showMyOngingNFT_is_endeds[i],
        end_time: this.state.showMyOngingNFT_end_times[i],
        auction_ID: this.state.showMyOngingNFT_auctionIDs[i],
      });
    }
    console.log(res);
    return res ? (
      <div>
        {res.map((term) => (
          <div>
            <Descriptions
              bordered
              style={{ width: 800 }}
              size="small"
              colum="2"
            >
              <Descriptions.Item label="Price">
                {web3.utils.fromWei(term.start_price, "ether")} ETH
              </Descriptions.Item>
              <Descriptions.Item label="Highest Price">
                {web3.utils.fromWei(term.highest_price, "ether")} ETH
              </Descriptions.Item>
              <Descriptions.Item label="End time">
                {new Date(term.end_time * 1000).toUTCString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status" align="center">
                {term.is_ended ? "Ended" : "In progress"}
              </Descriptions.Item>
            </Descriptions>

            <Image
              height={180}
              alt="NFT"
              src={"https://ipfs.io/ipfs/" + term.URI}
            />
            <Divider />
          </div>
        ))}
      </div>
    ) : null;
  };

  bid = async (term, e) => {
    e.preventDefault();
    //fixBUG:bid is async, sometimes bid_money is empty and bid_pre is executed!
    //add ref in input label
    let bid_money = this.state.price;
    console.log(bid_money);
    try {
      let res = await contractAuctionInstance.methods.bid(term.auction_ID).send({
        from: this.state.account,
        value: web3.utils.toWei(String(bid_money), "ether"),
        gas: "3000000",
      });
      console.log(res);
      alert("bid success");
      this.resetAll();
      await this.loadBlockchainData();
      this.setState({ isShowNFTMarket: true });
    } catch (e) {
      console.log(e);
      alert("bid fail!");
    }
  };

  endAuction = async (term) => {
    try {
      await contractAuctionInstance.methods
        .endAuction(term.auction_ID)
        .send({ from: this.state.account, gas: "3000000" });
      alert("claim NFT success");
      this.resetAll();
      await this.loadBlockchainData();
      this.setState({ isShowNFTMarket: true });
    } catch (e) {
      console.log(e);
      alert("claim NFT fail!");
    }
  };

  showHistory = (term) => {
    this.resetAll();
    this.setState({ isShowHistory: true, history: term.History });
  };

  showNFTMarket = () => {
    let res = [];
    for (let i = this.state.showMarketNFT_num - 1; i >= 0; i--) {
      res.push({
        URI: this.state.showMarketNFT_URIs[i],
        start_price: this.state.showMarketNFT_start_prices[i],
        highest_price: this.state.showMarketNFT_highest_prices[i],
        is_ended: this.state.showMarketNFT_is_endeds[i],
        end_time: this.state.showMarketNFT_end_times[i],
        auction_ID: this.state.showMarketNFT_auctionIDs[i],
        History: this.state.NFTHistory[this.state.showMarketNFT_auctionIDs[i]],
      });
    }
    console.log(res);
    return res ? (
      <div>
        {res.map((term) => (
          <div>
            {!term.is_ended ? (
              <div>
                <Descriptions
                  bordered
                  style={{ width: 900 }}
                  size="small"
                  colum="2"
                >
                  <Descriptions.Item label="Price">
                    {web3.utils.fromWei(term.start_price, "ether")} ETH
                  </Descriptions.Item>
                  <Descriptions.Item label="Highest price">
                    {web3.utils.fromWei(term.highest_price, "ether")} ETH
                  </Descriptions.Item>
                  <Descriptions.Item label="End time">
                    {new Date(term.end_time * 1000).toUTCString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status" align="center">
                    {term.is_ended ? "Ended" : "In progress"}
                  </Descriptions.Item>
                </Descriptions>

                <Button
                  danger
                  icon={<SearchOutlined />}
                  onClick={this.showHistory.bind(this, term)}
                >
                  history
                </Button>
                <p />
                <Image
                  height={180}
                  alt="NFT"
                  src={"https:/ipfs.io/ipfs/" + term.URI}
                />
                <form onSubmit={this.bid.bind(this, term)}>
                  <label>
                    bid:
                    <Input
                      style={{ width: 180 }}
                      prefix={<SketchCircleFilled />}
                      suffix="ETH"
                      size="large"
                      id="price"
                      type="number"
                      step="0.000000000000000001"
                      name="price"
                      onChange={this.handleChange}
                      ref={(input) => {
                        this.bid_money = input;
                      }}
                    />
                  </label>
                  <input type="submit" value="Bid" />
                </form>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={this.endAuction.bind(this, term)}
                >
                  Claim NFT
                </Button>
                <Divider />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    ) : null;
  };

  showBoughtNFT = () => {
    let res = [];
    for (let i = this.state.showBuyNFT_URI.length - 1; i >= 0; i--) {
      res.push({
        price: this.state.showBuyNFT_price[i],
        URI: this.state.showBuyNFT_URI[i],
      });
    }
    console.log(res);
    return (
      <div>
        {res.map((term) => (
          <div>
            <Card
              hoverable
              style={{ width: 400 }}
              cover={
                <Image
                  alt="NFT"
                  src={"https://ipfs.io/ipfs/" + term.URI}
                />
              }
            >
              <Meta
                title="Price"
                description={web3.utils.fromWei(term.price, "ether") + " ETH"}
              />
            </Card>
            <Divider />
          </div>
        ))}
      </div>
    );
  };

  render() {
    return (
      <div class="topMenu">
        <Home account={this.state.account} balance={this.state.balance} />
        <div>
        <h1 style={{textAlign:"left", width:900, margin:'auto'}}>Dashboard:</h1>
          <div align="center">
            <Menu theme="light" mode="horizontal" style={{ width: 900 }}>
              <Menu.Item>
                <Button
                  icon={<HomeOutlined />}
                  value="large"
                  type="primary"
                  onClick={() => {
                    this.resetAll();
                    console.log("click Mint NFT");
                    this.setState({ isShowMintNFT: true });
                  }}
                >
                  Mint NFT
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button
                  icon={<SettingFilled />}
                  value="large"
                  type="primary"
                  onClick={() => {
                    this.resetAll();
                    console.log("click showMyNFT");
                    this.setState({ isShowMyNFT: true });
                  }}
                >
                  My NFT
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button
                  icon={<SendOutlined />}
                  value="large"
                  type="primary"
                  onClick={() => {
                    this.resetAll();
                    console.log("click showMyOngingNFT");
                    this.setState({ isShowMyOngoingNFT: true });
                  }}
                >
                  My Auction
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button
                  icon={<ShopOutlined />}
                  value="large"
                  type="primary"
                  onClick={() => {
                    this.resetAll();
                    console.log("click show NFT market");
                    this.setState({ isShowNFTMarket: true });
                  }}
                >
                  NFT Market
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button
                  icon={<StarOutlined />}
                  value="large"
                  type="primary"
                  onClick={() => {
                    this.resetAll();
                    console.log("click bought NFT");
                    this.setState({ isShowBuyNFT: true });
                  }}
                >
                  Claimed NFT
                </Button>
              </Menu.Item>
            </Menu>
            <Divider />

            <BackTop />
            {/* 下面是铸造NFT界面的内容 */}
            <div>
              {this.state.isShowMintNFT ? (
                <div>
                  <div>
                    <label id="file"></label>
                    <input
                      type="file"
                      ref="file"
                      id="file"
                      name="file"
                      multiple="multiple"
                      // value={""}
                    />
                  </div>
                  <Divider />
                  <Button
                    icon={<UploadOutlined />}
                    value="large"
                    style={{ color: "black" }}
                    type="primary"
                    onClick={() => {
                      var file = this.refs.file.files[0];
                      var reader = new FileReader();
                      // reader.readAsDataURL(file);
                      reader.readAsArrayBuffer(file);
                      reader.onloadend = (e) => {
                        console.log(reader);
                        // 上传数据到IPFS
                        saveImageOnIpfs(reader).then((hash) => {
                          console.log(hash);
                          this.setState({ imgSrc: hash });
                        });
                      };
                    }}
                  >
                    Submit
                  </Button>
                  <Divider />
                  {this.state.imgSrc ? (
                    <div>
                      <Image
                        alt="testIPFS"
                        height={180}
                        src={"https://ipfs.io/ipfs/" + this.state.imgSrc}
                      />
                    </div>
                  ) : (
                    <div>
                      <h3>please upload your NFT image</h3>
                    </div>
                  )}
                  <Divider />
                  <Button
                    danger
                    shape="round"
                    icon={<SketchOutlined spin />}
                    type="primary"
                    style={{ color: "pink" }}
                    onClick={this.mintNFT}
                  >
                    mint
                  </Button>
                </div>
              ) : null}
            </div>
            {/* 下面是我铸造的NFT的内容 */}
            <div>{this.state.isShowMyNFT ? this.showMyNFT() : null}</div>
            {/* 下面是我所有拍卖的NFT的内容 */}
            <div>
              {this.state.isShowMyOngoingNFT ? this.showMyOngingNFT() : null}
            </div>
            {/* 下面是NFT市场的内容 */}
            <div>
              {this.state.isShowNFTMarket ? this.showNFTMarket() : null}
            </div>
            {/* 下面是NFT流转信息的内容 */}
            <div>
              {this.state.isShowHistory ? (
                <Descriptions
                  title="history"
                  layout="vertical"
                  bordered
                  style={{ width: 390 }}
                >
                  <Descriptions.Item>
                    {this.state.history.map((history) => (
                      <p>{history}</p>
                    ))}
                  </Descriptions.Item>
                </Descriptions>
              ) : null}
            </div>
            {/* 下面是买入NFT的内容 */}
            <div>{this.state.isShowBuyNFT ? this.showBoughtNFT() : null}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
