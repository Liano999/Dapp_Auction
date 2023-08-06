//SPDX-License-Identifier: MIT
// pragma experimental ABIEncoderV2;
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuctionFactory {
    NFTFactory public nftFactory;

    //every address(user) has an uint array of his own auction ids
    mapping(address => uint256[]) public auction_owners;

    mapping(uint256 => bool) public isNFTAuctioned;

    mapping(uint256 => uint256) public NFT_MapTo_AuctionID;

    //bought NFT from others, store the NFTIDs that he buys
    mapping(address => uint256[]) NFTBuyers;

    //the array to store all the auctions(include ongoing and ended auctions)
    Auction[] public auction_array;

    constructor(NFTFactory _nftFactory) {
        nftFactory = _nftFactory;
    }

    //create a new Auction
    function createAuction(
        uint256 nftID,
        uint256 begin_price,
        uint256 finish_time
    ) public {
        require(
            msg.sender == nftFactory.OwnerOF(nftID),
            "You are not user of the NFT!"
        );
        Auction newAuction = new Auction(nftID, payable(msg.sender), begin_price, begin_price, finish_time + block.timestamp, this, nftFactory);
        NFT_MapTo_AuctionID[nftID] = auction_array.length;
        isNFTAuctioned[nftID] = true;
        auction_owners[msg.sender].push(auction_array.length);
        auction_array.push(newAuction);
    }

    function bid(uint256 auctionID) public payable {
        auction_array[auctionID].bid{value: msg.value}(auctionID);
    }

    function endAuction(uint256 auctionID) public {
        auction_array[auctionID].endAuction(auctionID);
        uint256 NFTID = auction_array[auctionID].NFTid();
        isNFTAuctioned[NFTID] = false;
        nftFactory.addNFTOwners(msg.sender, NFTID);
        nftFactory.addNFTHistory(NFTID, msg.sender);
        NFTBuyers[msg.sender].push(NFTID);
    }

    function getAuctionStruct(uint256 auctionId)
        public
        view
        returns (Auction)
    {
        return auction_array[auctionId];
    }

    function traceNFTHistory(uint256 auctionID)
        public
        view
        returns (address[] memory)
    {
        return nftFactory.getNFTHistory(auction_array[auctionID].NFTid());
    }

    function getIsNFTAuctioned(uint256 auctionId) public view returns (bool) {
        return isNFTAuctioned[auctionId];
    }

    function showMyNFT(address owner)
        public
        view
        returns (
            uint256,
            uint256[] memory,
            string[] memory,
            bool[] memory
        )
    {
        uint256[] memory tokenIds = nftFactory.getNFTOwners(owner);
        uint256 num = tokenIds.length;

        string[] memory res = new string[](num);
        bool[] memory isAuctioned = new bool[](num);
        for (uint256 i = 0; i < num; i++) {
            res[i] = nftFactory.tokenURI(tokenIds[i]);
            isAuctioned[i] = isNFTAuctioned[tokenIds[i]];
        }
        return (num, tokenIds, res, isAuctioned);
    }

    function viewMyAllAuction_URI_price(address user)
        public
        view
        returns (
            string[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        uint256 count = auction_owners[user].length;
        string[] memory URI = new string[](count);
        uint256[] memory start_price = new uint256[](count);
        uint256[] memory highest_price = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 auction_id = auction_owners[user][i];
            Auction curr_auction = auction_array[auction_id];
            URI[i] = nftFactory.tokenURI(curr_auction.NFTid());
            start_price[i] = curr_auction.start_price();
            highest_price[i] = curr_auction.highest_price();

            // All[i] = curr;
        }
        return (URI, start_price, highest_price);
    }

    function viewMyAllAuction_time_isended_auctionID(address user)
        public
        view
        returns (
            uint256[] memory,
            bool[] memory,
            uint256[] memory
        )
    {
        uint256 count = auction_owners[user].length;
        uint256[] memory end_time = new uint256[](count);
        bool[] memory is_ended = new bool[](count);
        uint256[] memory auctionID = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 auction_id = auction_owners[user][i];
            Auction curr_auction = auction_array[auction_id];
            end_time[i] = curr_auction.end_time();
            is_ended[i] = curr_auction.end_time() < block.timestamp;
            auctionID[i] = auction_id;

            // All[i] = curr;
        }
        return (end_time, is_ended, auctionID);
    }

    function viewAllAuction_URI_price()
        public
        view
        returns (
            string[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        uint256 count = auction_array.length;
        string[] memory URI = new string[](count);
        uint256[] memory start_price = new uint256[](count);
        uint256[] memory highest_price = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 auction_id = i;
            Auction curr_auction = auction_array[auction_id];
            URI[i] = nftFactory.tokenURI(curr_auction.NFTid());
            start_price[i] = curr_auction.start_price();
            highest_price[i] = curr_auction.highest_price();

            // All[i] = curr;
        }
        return (URI, start_price, highest_price);
    }

    function viewAllAuction_time_isended_auctionID()
        public
        view
        returns (
            uint256[] memory,
            bool[] memory,
            uint256[] memory
        )
    {
        uint256 count = auction_array.length;
        uint256[] memory end_time = new uint256[](count);
        bool[] memory is_ended = new bool[](count);
        uint256[] memory auctionID = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 auction_id = i;
            Auction curr_auction = auction_array[auction_id];
            end_time[i] = curr_auction.end_time();
            is_ended[i] = curr_auction.is_ended();
            auctionID[i] = auction_id;

            // All[i] = curr;
        }
        return (end_time, is_ended, auctionID);
    }

    function showBoughtNFT(address user)
        public
        view
        returns (uint256[] memory, string[] memory)
    {
        uint256 last = NFTBuyers[user].length;
        uint256[] memory Price = new uint256[](last);
        string[] memory URI = new string[](last);
        uint256 auctionID;
        for (uint256 i = 0; i < last; i++) {
            auctionID = NFT_MapTo_AuctionID[NFTBuyers[user][i]];
            Price[i] = auction_array[auctionID].highest_price();
            URI[i] = nftFactory.tokenURI(NFTBuyers[user][i]);
        }
        return (Price, URI);
    }
}

contract Auction {
    AuctionFactory public auctionFactory;
    NFTFactory public nftFactory;

    uint256 public NFTid;
    address public beneficiary;
    uint256 public start_price;
    uint256 public highest_price;
    uint256 public end_time;
    bool public is_ended;

    constructor(
        uint256 _NFTid,
        address payable _beneficiary,
        uint256 _start_price,
        uint256 _highest_price,
        uint256 _end_time,
        AuctionFactory _auctionFactory,
        NFTFactory _nftFactory
    ) {
        NFTid = _NFTid;
        beneficiary = _beneficiary;
        start_price = _start_price;
        highest_price = _highest_price;
        end_time = _end_time;

        auctionFactory = _auctionFactory;
        nftFactory = _nftFactory;
    }

    //every bid has a from address and a value
    struct Bid {
        address from;
        uint256 value;
    }

    //every auction has its own ID, so every auction has an array recording all the bids
    mapping(uint256 => Bid[]) public auction_bids;

    function bid(uint256 auctionID) public payable {
        require(
            block.timestamp <= end_time,
            "Auction ended"
        );
        uint256 last = auction_bids[auctionID].length;
        require(
            msg.value > start_price,
            "Not enough value"
        );
        if (last > 0) {
            require(
                msg.value > auction_bids[auctionID][last - 1].value,
                "You need to offer a higher price"
            );
        }
        //make a new bid, change highest_price
        Bid memory newBid;
        newBid.from = msg.sender;
        newBid.value = msg.value;
        auction_bids[auctionID].push(newBid);
        //so auction_bids[auctionID] is of ascending order
        highest_price = msg.value;
    }

    //the highest bidder need to endAuction to claim the NFT, and refund the lower price bidder and the beneficiary
    function endAuction(uint256 auctionID) public {
        require(
            block.timestamp > end_time,
            "Auction not yet ended"
        );
        require(
            !is_ended,
            "NFT has been claimed"
        );
        uint256 last = auction_bids[auctionID].length;
        //no one bid on the auction, the auction creater need to end the auction
        if (last == 0) {
            require(
                msg.sender == beneficiary,
                "You are not owner of the auction"
            );
        } else {
            require(
                auction_bids[auctionID][last - 1].from == msg.sender,
                "You are not the highest_price"
            );
        }
        is_ended = true;
        //TODO:refund all the lower bids and give money to the auction creater
        if (last > 1) {
            for (uint256 i = 0; i < last - 1; i++) {
                payable(auction_bids[auctionID][i].from).transfer(
                    auction_bids[auctionID][i].value
                );
            }
        }
        if (last > 0) {
            payable(beneficiary).transfer(
                auction_bids[auctionID][last - 1].value
            );
        }
        
        uint256 NFTID = NFTid;
        
        nftFactory.removeOwnedNFT(nftFactory.OwnerOF(NFTID), NFTID);

    }
}

contract NFTFactory is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    //NFTOwners[address] stores the NFT IDs he owns
    mapping(address => uint256[]) public NFTOwners;

    mapping(string => uint256) public hashes;

    //NFTID => history owners[]
    mapping(uint256 => address[]) public NFTHistory;

    address public auctionFactory;

    constructor() ERC721("", "") {}

    modifier onlyFactory() {
        require(_msgSender() == auctionFactory, "No Premission");
        _;
    }

    function awardItem(address recipient, string memory tokenURI)
        public
        returns (uint256)
    {
        require(hashes[tokenURI] == 0, "the NFT has been minted");
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        hashes[tokenURI] = 1;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        NFTOwners[recipient].push(newItemId);
        NFTHistory[newItemId].push(recipient);

        return newItemId;
    }

    function removeOwnedNFT(address user, uint256 NFTID) public {
        uint256[] storage tokenIds = NFTOwners[user];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == NFTID) {
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                return;
            }
        }
    }

    function setAuctionFactory(address factory) public onlyOwner {
        auctionFactory = factory;
    }

    function addNFTOwners(address owner, uint256 id) public onlyFactory {
        NFTOwners[owner].push(id);
    }

    function addNFTHistory(uint256 id, address owner) public onlyFactory {
        NFTHistory[id].push(owner);
    }

    function getNFTOwners(address owner)
        public
        view
        returns (uint256[] memory)
    {
        return NFTOwners[owner];
    }

    function getNFTHistory(uint256 tokenId)
        public
        view
        returns (address[] memory)
    {
        return NFTHistory[tokenId];
    }

    function setNFTOwners(address owner, uint256[] memory tokenIds)
        public
        onlyFactory
    {
        NFTOwners[owner] = tokenIds;
    }

    function OwnerOF(uint256 NFTID) public view returns (address) {
        uint256 last = NFTHistory[NFTID].length - 1;
        return NFTHistory[NFTID][last];
    }

    function tokenID(string memory URI) public view returns (uint256) {
        return hashes[URI];
    }
}
