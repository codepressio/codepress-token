pragma solidity ^0.4.21;

import "./Owned.sol";
import "./SafeMath.sol";
import "./Pausable.sol"; 
import "./CDSToken.sol";

/**
商业推广：25% 200,000,000 每三个月,解锁 10%
0x5b749A38C8156bd8558963002ac5FA985E48f5c9

创始团队:10% 80,000,000 每三个月,解锁 5%
0x68f98eB4B65b81eea596aB1F046769256f3cC17d

社区: 35% 280,000,000 每三个月,解锁 10%
0xd995ae8480E215212ca4c22528997EaEd6085fd9
 */

contract PeriodicRelease is Owned, SafeMath, Pausable {
    address public community;
    address public commerce;
    address public team;

    CDSToken public token;
    address public tokenOwner;
    uint8 public period;
    uint256 public startTimestamp;
    mapping (address => uint256) public balances; 
    mapping (address => uint256) public transfered; // count of reward transfered.

    event TokenTransfer(address to, uint256 amount);

    function PeriodicRelease(
        CDSToken _token,
        address _community,
        address _commerce,
        address _team,
        uint256 _startTimestamp
    ) public {
        require(_startTimestamp > block.timestamp);
        startTimestamp = _startTimestamp;
        token = _token;
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

    function () payable public {
        revert();
    }

    /**
     * Release the token
     */
    function releaseToken() public notPaused {
       
    }
}
