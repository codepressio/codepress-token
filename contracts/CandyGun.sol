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

interface token {
    function transfer(address _to, uint256 _value) public returns (bool success);
}

// for test, not use on production
contract CandyGun is SafeMath, Owned {
    mapping(address => uint256) public balances;
    token public tokenReward;
    uint256 totalSupply;

    event CandyTransfer(address user, uint256 amount);

    function CandyGun(
        address _addressOfToken,
        uint256 _totalSupply
    ) public {
        tokenReward = token(addressOfTokenUsedAsReward);
        totalSupply = _totalSupply;
    }

    
    modifier enoughCandy() { 
        if (totalSupply > 0)
        _;
    }

    function addUserList(address[] user, uint256 amount) onlyOwner {
        require(amount > 0);
        require(amount.mul(user.length) > 0);
        require(amount.mul(user.length) < totalSupply);
        require(balances.length == 0, "user list is not empty");

        for (var i = 0; i < user.length; i++) {
            balances[user[i]] = amount;
        }
    }

    function sendCandy() onlyOwner {
        for (var i = 0; i < balances.length; i++) {
            tokenReward.transfer(balances[i], amount);
        }
    }




    /**
     * Withdraw the funds
     *
     * Checks to see if goal or time limit has been reached, and if so, and the funding goal was reached,
     * sends the entire amount to the beneficiary. If goal was not reached, each contributor can withdraw
     * the amount they contributed.
     */
    function safeWithdrawal() enoughCandy public {
        if (!fundingGoalReached) {
            uint amount = balances[msg.sender];
            balances[msg.sender] = 0;
            if (amount > 0) {
                if (msg.sender.send(amount)) {
                    emit FundTransfer(msg.sender, amount, false);
                } else {
                    balances[msg.sender] = amount;
                }
            }
        }

        if (fundingGoalReached && beneficiary == msg.sender) {
            if (beneficiary.send(amountRaised)) {
                emit FundTransfer(beneficiary, amountRaised, false);
            } else {
                //If we fail to send the funds to beneficiary, unlock funders balance
                fundingGoalReached = false;
            }
        }
    }
}
