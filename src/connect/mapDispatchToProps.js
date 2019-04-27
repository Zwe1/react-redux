import { bindActionCreators } from 'redux'
import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'

export function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
  return typeof mapDispatchToProps === 'function'
    ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps')
    : undefined
}

export function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
  return !mapDispatchToProps
    ? wrapMapToPropsConstant(dispatch => ({ dispatch }))
    : undefined
}

export function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
  return mapDispatchToProps && typeof mapDispatchToProps === 'object'
    ? // mapDispatchToProps传递了对象时，直接通过redux的bindActionCreators方法，为每个action绑定dispatch，这样当你调用某个action时，便会自动dispatch
      wrapMapToPropsConstant(dispatch =>
        bindActionCreators(mapDispatchToProps, dispatch)
      )
    : undefined
}

export default [
  // 支持mapDispatchToProps直接传递函数
  whenMapDispatchToPropsIsFunction,
  whenMapDispatchToPropsIsMissing,
  // 支持mapDispatchToProps直接传递对象
  whenMapDispatchToPropsIsObject
]
