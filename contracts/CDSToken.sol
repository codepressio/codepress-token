pragma solidity ^0.4.21;

import "./Owned.sol";
import "./SafeMath.sol";
import "./EIP20Interface.sol"; 


contract CDSToken is Owned, SafeMath, EIP20Interface {
    string public name;
    string public symbol;
    uint8 public decimals;

    uint8 public version = 1;
    
    mapping (address => uint256) public balances;
    mapping (address => uint256) public frozen;
    mapping (address => mapping (address => uint256)) public allowed;

    event Freeze(address indexed from, uint256 value);
    event Unfreeze(address indexed from, uint256 value);

    function CDSToken() public {
        name = "CodePress Token";
        symbol = "CPT";
        decimals = 18;
        totalSupply = 300000000 * 10 ** uint256(decimals);
        balances[msg.sender] = totalSupply;
    }

    // cds part
    function freeze(address _addr, uint256 _value) public onlyOwner returns (bool success) {
        require(balances[_addr] >= _value);
        require(_value > 0);
        balances[_addr] = sub(balances[_addr], _value);
        frozen[_addr] = add(frozen[_addr], _value);
        emit Freeze(_addr, _value);
        return true;
    }
    
    function unfreeze(address _addr, uint256 _value) public onlyOwner returns (bool success) {
        require(frozen[_addr] >= _value);
        require(_value > 0);
        frozen[_addr] = sub(frozen[_addr], _value);
        balances[_addr] = add(balances[_addr], _value);
        emit Unfreeze(_addr, _value);
        return true;
    }

    function frozenOf(address _owner) public view returns (uint256 balance) {
        return frozen[_owner];
    }
    
    // erc20 part
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value);
        require(balances[_to] + _value >= balances[_to]);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(balances[_from] >= _value);
        require(balances[_to] + _value >= balances[_to]);
        require(allowed[_from][msg.sender] >= _value);
        balances[_to] += _value;
        balances[_from] -= _value;
        allowed[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_value > 0);
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    } 
}