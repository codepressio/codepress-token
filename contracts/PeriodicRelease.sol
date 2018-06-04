pragma solidity ^0.4.21;


contract Owned {
    address public owner;

    function Owned() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}


contract SafeMath {
    function mul(uint a, uint b) internal pure returns (uint) {
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint a, uint b) internal pure returns (uint) {
        assert(b > 0);
        uint c = a / b;
        assert(a == b * c + a % b);
        return c;
    }

    function sub(uint a, uint b) internal pure returns (uint) {
        assert(b <= a);
        return a - b;
    }

    function add(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        assert(c >= a);
        return c;
    }
}


contract Pausable is Owned {
    bool public paused = false;
    event Pause();
    event Unpause();

    modifier notPaused {
        require(!paused);
        _;
    }

    function pause() public onlyOwner {
        paused = true;
        emit Pause();
    }

    function unpause() public onlyOwner {
        paused = false;
        emit Unpause();
    }
}

/**
commerce：25% 200,000,000 every 3 month,release 10%
0x5b749A38C8156bd8558963002ac5FA985E48f5c9

team:10% 80,000,000 every 3 month,release 5%
0x68f98eB4B65b81eea596aB1F046769256f3cC17d

community: 35% 280,000,000 every 3 month,release 10%
0xd995ae8480E215212ca4c22528997EaEd6085fd9
 */
interface token {
    function transfer(address _to, uint256 _value) public returns (bool success);
}

contract PeriodicRelease is Owned, SafeMath, Pausable {
    address public community;
    address public commerce;
    address public team;
    address public tokenOwner;

    token public tokenCDS;
    uint8 public period;
    uint256 public startTimestamp;
    mapping (address => uint256) public balances; 
    mapping (address => uint256) public transfered; // count of reward transfered.

    event TokenTransfer(address to, uint256 amount);

    function PeriodicRelease(
        address _token,
        address _community,
        address _commerce,
        address _team,
        uint256 _startTimestamp
    ) public {
        require(_startTimestamp > block.timestamp);
        startTimestamp = _startTimestamp;
        tokenCDS = token(_token);
        community = _community;
        commerce = _commerce;
        team = _team;

        // 社区: 35% 280,000,000 每三个月,解锁 10%
        balances[community] = 200000000 * (10 ** 18);
        // 商业推广：25% 200,000,000 每三个月,解锁 10%
        balances[commerce] = 80000000 * (10 ** 18);
        // 创始团队:10% 80,000,000 每三个月,解锁 5%
        balances[team] = 280000000 * (10 ** 18);

        period = 3; // every 3 month
        tokenOwner = msg.sender;
    }

    /**
     * Release the token
     */
    function releaseToken() public onlyOwner notPaused {
       
    }
}
