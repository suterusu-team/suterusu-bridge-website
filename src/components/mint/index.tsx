import React from 'react';
import { Row, Col, Button } from 'antd';
import ERC20SuterCoin from '../../static/erc20_suter_coin.svg';
import BEP20SuterCoin from '../../static/bep20_suter.svg';
import WAValidator from 'multicoin-address-validator';
import Web3 from 'web3';
import SpinModal from '../spinModal';
var Contract = require('web3-eth-contract');
import {
  openNotificationWithIcon,
  MessageWithAlink,
  suterValueForInputFunc,
  suterAmountForInput,
  getSuterValueNumber,
  fetchSuterPrice,
} from '../tools';
import './index.less';

class Mint extends React.Component {
  state = {
    suterValue: '',
    suterTxt: 'SUTER',
    suterValueFontSize: 52,
    destinationAddress: '',
    proccesing: false,
  };

  constructor(props) {
    super(props);
    this.handleSuterAmountChange = this.handleSuterAmountChange.bind(this);
    this.assignRef = this.assignRef.bind(this);
    this.handleDestinationChange = this.handleDestinationChange.bind(this);
    this.callApprove = this.callApprove.bind(this);
    this.callExchange = this.callExchange.bind(this);
  }
  componentDidMount() {}

  async setSuterPrice() {
    let price = await fetchSuterPrice();
    this.setState({ suterPrice: price });
  }

  assignRef(c: HTMLElement) {
    this.inputRef = c;
  }

  handleSuterAmountChange(e) {
    let suterTxt = this.state.suterTxt;
    let suterAmount = e.target.value
      .replace(` ${suterTxt}`, '')
      .replace(/,/gi, '');
    if (isNaN(suterAmount) || suterAmount < 0 || suterAmount > 10000000000) {
      if (suterAmount > 10000000000) {
        openNotificationWithIcon(
          'Invalid Suter Amount',
          'Suter token total supply is 10,000,000,000',
          'warning',
          4.5,
        );
      }
      suterAmount = this.state.suterValue;
    }
    let suterValueFontSize = this.state.suterValueFontSize;

    if (suterAmount.length > 6) {
      suterValueFontSize = Math.max(
        suterValueFontSize - (suterAmount.length - 6) * 5,
        20,
      );
    } else {
      suterValueFontSize = 52;
    }
    let dollarValue = this.state.suterPrice * suterAmount;
    this.setState(
      {
        suterValue: suterAmount,
        dollarValue: dollarValue,
        suterValueFontSize: suterValueFontSize,
      },
      () => {
        let pos = this.inputRef.value.length - this.state.suterTxt.length - 1;
        this.inputRef.selectionStart = pos;
        this.inputRef.selectionEnd = pos;
      },
    );
  }

  handleDestinationChange(e) {
    this.setState({ destinationAddress: e.target.value });
    if (e.target.value != '' && !WAValidator.validate(e.target.value, 'eth')) {
      openNotificationWithIcon(
        'Invalid input',
        `'${e.target.value}' is not a valid tron address`,
        'warning',
        1,
      );
    }
  }

  async submit() {
    const suterValue = this.state.suterValue;
    const suterAmount = getSuterValueNumber(suterValue);
    var lastestWeb3 = new Web3(window.ethereum);
    let amount = lastestWeb3.utils.toWei(suterAmount.toString());
    // check if allowance is enough
    const suterContract = new Contract(
      ETHSUTERUSUABI,
      ETHSUTERUSUCONTRACTADDRESS,
    );
    suterContract.setProvider(window.ethereum);
    let allowance = await suterContract.methods
      .allowance(this.props.account, ETHBRIDGECONTRACTADDRESS)
      .call();

    if (allowance - amount >= 0) {
      this.callExchange();
    } else {
      this.confirmToApprove();
    }
  }

  async callApprove() {
    this.setState({ proccesing: true });
    const suterValue = this.state.suterValue;
    const suterAmount = getSuterValueNumber(suterValue);
    let txHash;
    let transaction;
    const suterContract = new Contract(
      ETHSUTERUSUABI,
      ETHSUTERUSUCONTRACTADDRESS,
    );
    suterContract.setProvider(window.ethereum);
    try {
      var lastestWeb3 = new Web3(window.ethereum);
      let amount = lastestWeb3.utils.toWei(suterAmount.toString());
      transaction = await suterContract.methods
        .increaseAllowance(ETHBRIDGECONTRACTADDRESS, amount)
        .send({ from: this.props.account, gas: '60000' });
    } catch (error) {
      console.log('callApprove error=', error);
      openNotificationWithIcon(
        'Metamask deny!',
        'User denied transaction signature',
        'warning',
        10,
      );
      this.setState({ submitApprove: false, proccesing: false });
      return;
    }
    txHash = transaction['transactionHash'];
    const message = `View in etherscan`;
    const aLink = `${ETHERSCAN}/tx/${txHash}`;
    openNotificationWithIcon(
      'Approve transaction has success sent!',
      <MessageWithAlink message={message} aLink={aLink} />,
      'success',
      10,
    );
    this.setState({ proccesing: false });
    this.setState({ approveTxid: txHash });
  }

  async callExchange() {
    this.setState({ proccesing: true });
    const { suterValue, destinationAddress } = this.state;
    const suterAmount = getSuterValueNumber(suterValue);
    let txHash;
    let transaction;
    const ethBridgeContract = new Contract(
      ETHBRIDGEABI,
      ETHBRIDGECONTRACTADDRESS,
    );
    ethBridgeContract.setProvider(window.ethereum);
    try {
      var lastestWeb3 = new Web3(window.ethereum);
      let amount = lastestWeb3.utils.toWei(suterAmount.toString());
      transaction = await ethBridgeContract.methods
        .exchange(amount, destinationAddress)
        .send({ from: this.props.account, gas: '100000' });
    } catch (error) {
      console.log('callExchange error=', error);
      openNotificationWithIcon(
        'Metamask deny!',
        'User denied transaction signature',
        'warning',
        10,
      );
      this.setState({
        approveStatus: 0,
        submitApprove: false,
        proccesing: false,
      });
      return;
    }
    txHash = transaction['transactionHash'];
    const message = `View in etherscan`;
    const aLink = `${ETHERSCAN}/tx/${txHash}`;
    openNotificationWithIcon(
      'Exchange transaction has success sent!',
      <MessageWithAlink message={message} aLink={aLink} />,
      'success',
      10,
    );
    this.setState({ exchangeTxid: txHash, proccesing: false });
    this.updateExchangeTxid(txHash);
  }
  render() {
    const { suterValue, suterTxt, destinationAddress, proccesing } = this.state;
    const suterValueForInput = suterValueForInputFunc(suterValue);
    const suterAmountValue = suterAmountForInput(suterValue, suterTxt);
    const canNext =
      WAValidator.validate(destinationAddress, 'eth') &&
      getSuterValueNumber(suterValue) > 0;
    return (
      <div className="mint">
        {proccesing ? <SpinModal /> : ''}
        <h1 className="title">Mint</h1>
        <Row>
          <Col span={24}>
            <div className="inputContainer container">
              <p className="inputDesc">Amount</p>
              <input
                inputMode="numeric"
                className="input"
                ref={this.assignRef}
                value={suterAmountValue}
                placeholder="0.00 SUTER"
                type="text"
                onChange={this.handleSuterAmountChange}
              />
              <div className="inputAppend">
                <img src={ERC20SuterCoin} />
                <span>ERC20 SUTER</span>
              </div>
              <p className="balance">Your SUTER Balance: 133,242.02</p>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="inputContainer container">
              <p className="inputDesc">Recipient Address</p>
              <input
                className="destinationInput"
                placeholder="Enter BEP20 SUTER Address"
                value={destinationAddress}
                type="text"
                onChange={this.handleDestinationChange}
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="assetContainer container">
              <div className="title">You will receive</div>
              <div className="assets">
                <div>{suterValueForInput}</div>
                <div className="assetsDesc">
                  <img src={BEP20SuterCoin} />
                  &nbsp;
                  <span style={{ fontWeight: 'bold' }}>BEP20</span>&nbsp;
                  <span>SUTER</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="btnContainer container">
              <Button
                shape="round"
                block
                disabled={!canNext}
                onClick={this.submit}
              >
                Confirm
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Mint;
