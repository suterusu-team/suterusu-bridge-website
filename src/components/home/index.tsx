import React from "react"
import { Row, Col, Button, Dropdown, Carousel } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import MetaMask from '../../static/metamask.svg';
import TronLink from '../../static/tronLink.png';
import './index.less';

class Home extends React.Component {
  constructor(props){
    super(props);
  }
  render () {
  	const { dropDownMenu } = this.props
  	return (
  		<div className="home">
  		  <Row>
          <Col span={24}>
            <div className="title">
              <h1>Suter Bridge Alpha</h1>
              <h1>A Glance of Suter VM</h1>
            </div>
           </Col>
       </Row>
       <Row>
          <Col span={24}>
            <div className="metamaskContainer">
              <div style={{"width": "250px"}}>
                <Carousel autoplay={true} dots={false}>
                  <div>
                    <img src={ MetaMask } width="250px" />
                  </div>
                  <div>
                    <img src={ TronLink } width="250px" />
                  </div>
                </Carousel>
              </div>
            </div>
          </Col>
       </Row>
       <Row>
           <Col span={24}>
             <div className="tipTextContainer">
               <p>To mint or revert assets, connect your wallet.</p>
             </div>
           </Col>
          </Row>
          <Row>
           <Col span={24}>
             <div className="connectWalletButtonContainer">
             <Dropdown overlay={dropDownMenu()}>
               <Button type="primary" size="large">
                 CONNECT WALLET <DownOutlined />
                </Button>
             </Dropdown>
             </div>
           </Col>
        </Row>
      </div>
  	)
  }
}

export default Home