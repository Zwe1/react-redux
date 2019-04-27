import verifyPlainObject from '../utils/verifyPlainObject'

export function wrapMapToPropsConstant(getConstant) {
  return function initConstantSelector(dispatch, options) {
    const constant = getConstant(dispatch, options)

    function constantSelector() {
      return constant
    }
    constantSelector.dependsOnOwnProps = false
    return constantSelector
  }
}

// dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
// to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
// whether mapToProps needs to be invoked when props have changed.
// 1. dependsOnOwnProps方法用于中createMapToPropsProxy，它用于判断是否需要将props作为参数传递给被封装的mapToProps方法。它也被用在makePurePropsSelector中，用于判断
// 在props发生变化时mapToProps是否需要被调用。
// A length of one signals that mapToProps does not depend on props from the parent component.
// 2. 返回一个长度信号，来标明mapToProps不依赖于父组件传入的props。
// A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
// therefore not reporting its length accurately..
// 3. 如果长度为0，则表示mapToProps通过arguments或者...args来获取参数，因此反馈的长度可能不准确。
export function getDependsOnOwnProps(mapToProps) {
  return mapToProps.dependsOnOwnProps !== null &&
    mapToProps.dependsOnOwnProps !== undefined
    ? // 首先通过dependsOnOwnProps属性来判断mapToProps是否依赖于props。
      Boolean(mapToProps.dependsOnOwnProps)
    : // 再次通过mapToProps的参数来判断mapToProps是否依赖于props。
      // mapToProps.length用于获取mapToProps的形参个数，但是如果在函数体内通过arguments获取或者传入的是...arg，则长度会不准确。
      mapToProps.length !== 1
}

// Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
// this function wraps mapToProps in a proxy function which does several things:
//
//  * Detects whether the mapToProps function being called depends on props, which
//    is used by selectorFactory to decide if it should reinvoke on props changes.
//  1. 在selectorFactory中调用这个方法来决定是否应该忽略props的变化，此方法用于检测被调用的mapToProps函数是否依赖于props。
//  * On first call, handles mapToProps if returns another function, and treats that
//    new function as the true mapToProps for subsequent calls.
//  2. 在第一次调用时，如果返回了另外一个函数，则再次调用这个返回的函数，将其视作后续该调用的mapToProps，此处做了递归调用。
//  * On first call, verifies the first result is a plain object, in order to warn
//    the developer that their mapToProps function is not returning a valid result.
//  3. 在第一个调用时，验证第一次返回的结果是否为简单对象，对返回值进行校验，检验是否为合法值，不合格时进行提示。
export function wrapMapToPropsFunc(mapToProps, methodName) {
  return function initProxySelector(dispatch, { displayName }) {
    const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      return proxy.dependsOnOwnProps
        ? proxy.mapToProps(stateOrDispatch, ownProps)
        : proxy.mapToProps(stateOrDispatch)
    }

    // allow detectFactoryAndVerify to get ownProps
    proxy.dependsOnOwnProps = true

    proxy.mapToProps = function detectFactoryAndVerify(
      stateOrDispatch,
      ownProps
    ) {
      proxy.mapToProps = mapToProps
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps)
      let props = proxy(stateOrDispatch, ownProps)

      if (typeof props === 'function') {
        // 如果props是函数，会做一个循环调用
        // 此处支持了mapToProps以 () => () => () => ({}) 的形式传参，但依然能得到最终的对象。
        proxy.mapToProps = props
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props)
        props = proxy(stateOrDispatch, ownProps)
      }

      if (process.env.NODE_ENV !== 'production')
        // 如果不是简单对象，会抛出错误，
        verifyPlainObject(props, displayName, methodName)

      // 此时props为一个简单对象，会返回这个值
      return props
    }

    return proxy
  }
}
