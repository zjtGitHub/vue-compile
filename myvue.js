const compileUtil = {
  getVal(expr, vm) {
    // reduce(callback, initialValue(callback中的data初始值))
    return expr.split('.').reduce((data, currentVal) => {
      // console.log(data);
      // console.log(currentVal);
      return data[currentVal]
    }, vm.$data)
  },
  text(node, expr, vm) { // expr:msg vm:当前实例
    const value = this.getVal(expr, vm)
    this.updater.textUpdater(node, value)
  },
  html(node, expr, vm) {
    const value = this.getVal(expr, vm)
    this.updater.htmlUpdater(node, value)
  },
  model(node, expr, vm) {
    const value = this.getVal(expr, vm)
    this.updater.modelUpdater(node, value)
  },
  on(node, expr, vm) {},
  updater: {
    textUpdater(node, value) {
      node.textContent = value
    },
    htmlUpdater(node, value) {
      node.innerHTML = value
    },
    modelUpdater(node, value) {
      node.value = value
    }
  }
}





// 编译类
class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    this.vm = vm
    // 1.获取文档碎片 减少性能损耗
    const fragment = this.nodeFragment(this.el) 
    // 2.编译模板
    this.compile(fragment)
    // 3.追加子元素到根元素
    this.el.appendChild(fragment)
  }

  /**
   * 判断是否是元素节点
   * @param {*} node 
   */
  isElementNode (node) {
    return node.nodeType === 1
  }

  /**
   * 获取子节点并渲染
   * @param {*} frag 
   */
  compile (frag) {
    // 获取子节点
    const childNodes = frag.childNodes
    Array.prototype.forEach.call(childNodes, (child => {
      if (this.isElementNode(child)) {
        // 是元素节点
        // console.log('元素节点：',child)
        this.compileElement(child)
      } else {
        // 文本节点
        // console.log('文本节点：',child)
        this.compileText(child)
      }

      if (child.childNodes && childNodes.length) {
        this.compile(child)
      }
    }))
  }

  /**
   * 编译元素
   * @param {*} el 
   */
  compileElement (node) {
    const attributes = node.attributes
    // console.log(attributes);
    Array.prototype.forEach.call(attributes, attr => {
      const {name, value} = attr
      // 判断是否是v-开头
      if (this.isDirective(name)) {
        const [,directive] = name.split('-')
        const [dirName, eventName] = directive.split(':') // text html model on
        // console.log(dirName);
        // 更新数据 数据驱动视图
        compileUtil[dirName](node, value, this.vm, eventName)
        // 删除有指令的标签上的属性
        node.removeAttribute(name)
      }
      
    })
  }

  /**
   * 编译模板字符
   * @param {*} attrName 
   */
  compileText(node) {
    console.log(node.textContent);
      
  }

  /**
   * 判断是否是v-指令
   * @param {*} node 
   */
  isDirective (attrName) {
    return attrName.startsWith('v-')
  }

  /**
   * 创建文档碎片并将文档碎片加入到dom中去
   * @param {*} el 
   */
  nodeFragment (el) {
    //创建文档对象
    const f = document.createDocumentFragment()
    let firstchild
    // 这里把el中元素遍历到firstchild中
    while (firstchild = el.firstChild) {
      f.appendChild(firstchild)
    }
    return f
  }
}


class Mvue {
  constructor(options) {
    this.$el = options.el
    this.$data = options.data
    this.$options = options

    if (this.$el) {
      new Compile(this.$el, this)
      console.log(this)
    }
  }
}