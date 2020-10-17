import React from "react"
import {notification } from 'antd';
import numeral from 'numeral-es6';

const openNotificationWithIcon = (title: string, desc: any, type: string, duration: number = 0) => {
    notification[type]({
      message: title,
      description: desc,
      duration: duration,
    });
  }


const getSuterValueInteger = (suterValue: string):number => {
    if(suterValue.indexOf('.') !== -1){
      return parseInt(suterValue.split('.')[0])
    }else{
      return parseInt(suterValue)
    }
  }

const getSuterValueDecimal = (suterValue: string):string => {
  if(suterValue.indexOf('.') !== -1){
    return `.${suterValue.split('.')[1]}`
  }else{
    return ''
  }
}

const getSuterValueNumber = (suterValue: string): number => {
  let suterValueProcess = suterValue.replace(/,/g, '')
  if(suterValueProcess != ''){
    return parseFloat(suterValueProcess)
  }
  return 0
}

function suterValueForInputFunc(suterValue){
  const suterValueForInput = `${numeral(getSuterValueInteger(suterValue)).format('0,0') }${getSuterValueDecimal(suterValue)}`
  return suterValueForInput
}

function suterAmountForInput(suterValue, suterTxt) {
  const suterValueForInput = suterValueForInputFunc(suterValue, suterTxt)
  const suterAmountValue = (suterValue !== '' ? `${ suterValueForInput } ${suterTxt}` : '')
  return suterAmountValue
}

const MessageWithAlink = (props) => {
  return <a href={props.aLink} target='_blank'>{ props.message }</a>
}

export { openNotificationWithIcon, MessageWithAlink, suterValueForInputFunc, suterAmountForInput, getSuterValueNumber }