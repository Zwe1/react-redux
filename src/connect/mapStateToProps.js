import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'

export function whenMapStateToPropsIsFunction(mapStateToProps) {
  return typeof mapStateToProps === 'function'
    ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps')
    : undefined
}

export function whenMapStateToPropsIsMissing(mapStateToProps) {
  // 提供一个默认函数，当传入mapStateToProps时进行下一步检验
  return !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : undefined
}

// 输出的两个方法被倒序调用，先检验mapStateToProps是否缺失，再检验mapStateToProps是否为函数
export default [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing]
