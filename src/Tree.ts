import {Node} from './Node'
import {LEFT_PARENTHESIS, operators, RIGHT_PARENTHESIS} from './types'
// @ts-ignore
import {treeFromArray, treeToASCII} from '../node_modules/treevis/tree'

const enum PARENT {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT'
}

export class Tree {
    root: Node | null

    constructor(treeRoot: Node | null = null) {
        this.root = treeRoot
    }

    get height() {
        return this.getHeight(this.root)
    }

    print() {
        const array = Tree.toArray(this.root)
        treeToASCII(treeFromArray(array))
    }

    printFullTree() {
        const emptyTree = this.getFullEmptyTree(this.height)
        const fullTree = this.getFullTree(this.root)
        const array = Tree.toArray(fullTree)
        treeToASCII(treeFromArray(array))
    }

    private getHeight(root: Node | null): number {
        if (root === null) {
            return 0
        }
        return 1 + Math.max(this.getHeight(root.left), this.getHeight(root.right))
    }

    private getFullEmptyTree(height: number, root?: Node | undefined) {
        if (root === undefined) {
            root = new Node()
        }
        if (height > 1) {
            root.left = new Node()
            root.right = new Node()
            this.getFullEmptyTree(height - 1, root.left)
            this.getFullEmptyTree(height - 1, root.right)
        }
        return root
    }

    private static toArray(root: Node | null): (string | number | null)[] {
        if (root === null) {
            return []
        }
        return this.whileToArray([root])
    }

    private static whileToArray(stack: (Node | null)[]): (string | number | null)[] {
        if (stack.length === 0) {
            return []
        }

        const first = stack[0]
        if (first) {
            return [first.value, ...this.whileToArray([...stack.slice(1), first.left, first.right])]
        } else {
            return [null, ...this.whileToArray([...stack.slice(1)])]
        }

    }

    private getFullTree(root: Node | null): Node {
        if (root === null) {
            return new Node()
        }
        const value = root.value
        const left = root.left !== null ? this.getFullTree(root.left) : null
        const right = root.right !== null ? this.getFullTree(root.right) : null
        return new Node(value, left, right)
    }
}

const expr = (expression: string): Tree => {
    const tokens = expression.split('').filter(el => el !== ' ')
    return new Tree(gen(tokens))
}

const gen = (tokens: string[]): Node => {
    // const root = new Node()
    if (tokens.length === 1) {
        return new Node(tokens[0])
    }
    const lowPriorityIndex = getLowPriorityToken(tokens)
    // Если нет оператора вне скобок
    if (lowPriorityIndex === -1) {
        if (tokens[0] !== LEFT_PARENTHESIS || tokens[tokens.length - 1] !== RIGHT_PARENTHESIS) {
            throw new Error(`Don't know what to do with ${tokens}`)
        }
        return gen(tokens.slice(1, -1))
    }
    const value = tokens[lowPriorityIndex]
    const left = gen(tokens.slice(0, lowPriorityIndex))
    const right = gen(tokens.slice(lowPriorityIndex + 1))
    return new Node(value, left, right)
}

// Возвращает приоритет оператора: чем больше возращаемое значение - тем больше приоритет
const getPriority = (operator: string): number => {
    // Сгруппированы в порядке возрастания приоритета
    const operatorsPriority = [['+', '-'], ['*', '/']]
    return forPriority(operator, operatorsPriority, 0)
}

const forPriority = (operator: string, operatorsPriority: string[][], i: number): number => {
    if (operatorsPriority.length === 0) {
        return -1
    }

    if (operatorsPriority[0].includes(operator)) {
        return i
    }

    return forPriority(operator, operatorsPriority.slice(1), ++i)
}

// Возвращает индекс оператора с наименьшим приоритетом
const getLowPriorityToken = (tokensArray: string[]): number => {
    const lowPriority = Number.MAX_VALUE
    const index = -1
    const parenthesesCount = 0
    return forLow(tokensArray, lowPriority, parenthesesCount, 0, index)
}

const forLow = (tokensArray: string[], lowPriority: number, parenthesesCount: number, i: number, index: number): number => {
    if (tokensArray.length === 0) {
        return index
    }

    const token = tokensArray[0]
    if (operators.includes(token) && parenthesesCount === 0) {
        const tokenPriority = getPriority(token)
        if (tokenPriority < lowPriority) {
            // lowPriority = tokenPriority
            const newIndex = i
            return forLow(tokensArray.slice(1), tokenPriority, parenthesesCount, ++i, newIndex)
        } else {
            return forLow(tokensArray.slice(1), lowPriority, parenthesesCount, ++i, index)
        }
    } else if (token === '(') {
        return forLow(tokensArray.slice(1), lowPriority, ++parenthesesCount, ++i, index)
    } else if (token === ')') {
        return forLow(tokensArray.slice(1), lowPriority, --parenthesesCount, ++i, index)
    } else {
        return forLow(tokensArray.slice(1), lowPriority, parenthesesCount, ++i, index)
    }
}

const treeSolve = (tree: Tree | null): number => {
    if (tree === null) {
        return -1
    }

    return solve(tree.root)
}

const solve = (root: Node | null = null): any => {
    if (root === null) {
        throw new Error('Tree is empty')
    }
    const {value, left, right} = root
    if (!isNaN(parseFloat(value as string))) {
        return parseFloat(value as string)
    } else if (operators.includes(value as string)) {
        if (left === null || right === null) {
            throw new Error(`Need arguments for ${value}`)
        }
        switch (value) {
            case '+':
                return solve(left) + solve(right)
            case '-':
                return solve(left) - solve(right)
            case '*':
                return solve(left) * solve(right)
            case '/':
                return solve(left) / solve(right)
        }
    } else {
        if (typeof value === 'string' && value.trim() === '') {
            throw new Error('Empty node')
        } else {
            throw new Error(`Invalid character ${value}`)
        }
    }
}

const insert = (tree: Tree | null, value: string | number, level: number, position: number): Tree => {
    if (tree === null) {
        return new Tree()
    }

    if (position > Math.pow(2, level - 1)) {
        return tree
    }

    if (tree.root === null) {
        if (level === 1 && position === 1) {
            // this.root = new Node(value)
            return new Tree(new Node(value))
        } else {
            return tree
        }
    }
    return new Tree(whileInsert(tree.root, position, 1, level, value))
}

const whileInsert = (currentNode: Node | null, localPosition: number, currentLevel: number, level: number,
                     value: string | number): Node | null => {

    if (currentNode === null) {
        return null
    }

    if (level === currentLevel) {
        return new Node(value, currentNode.left, currentNode.right)
    }

    const middle = Math.pow(2, level - currentLevel - 1)
    // Если нужна позиция больше чем середина (для текущего уровня)
    if (localPosition > middle) {
        if (currentNode.right === null) {
            // Если справа пустая Node, но она нам и нужна
            if (level === currentLevel + 1 && localPosition <= 2) {
                return new Node(currentNode.value, currentNode.left, new Node(value))
            }
            return null
        }
        const newLocalPosition = localPosition - middle
        const right = whileInsert(currentNode.right, newLocalPosition, ++currentLevel, level, value)
        return new Node(currentNode.value, currentNode.left, right)
    } else {
        if (currentNode.left === null) {
            if (level === currentLevel + 1) {
                return new Node(currentNode.value, new Node(value), currentNode.right)
            }
            return null
        }
        const left = whileInsert(currentNode.left, localPosition, ++currentLevel, level, value)
        return new Node(currentNode.value, left, currentNode.right)
    }
}

const remove = (tree: Tree, level: number, position: number): Tree => {
    if (tree.root === null) {
        return tree
    }

    return new Tree(whileRemove(tree.root, tree.root, position, 1, null, level))
}

const whileRemove = (currentNode: Node | null, parent: Node | null, localPosition: number,
                     currentLevel: number, direction: PARENT | null, level: number): Node | null => {

    if (currentNode === null) {
        console.log('curr = null')
        return null
    }

    if (level === currentLevel) {
        return null
    }

    const middle = Math.pow(2, level - currentLevel - 1)
    if (localPosition > middle) {
        if (currentNode.right === null) {
            return currentNode
        }
        const newLocalPosition = localPosition - middle
        const right = whileRemove(currentNode.right, currentNode, newLocalPosition, ++currentLevel, PARENT.RIGHT, level)
        return new Node(currentNode.value, currentNode.left, right)
    } else {
        if (currentNode.left === null) {
            return currentNode
        }
        const left = whileRemove(currentNode.left, currentNode, localPosition, ++currentLevel, PARENT.LEFT, level)
        return new Node(currentNode.value, left, currentNode.right)
    }
}

export {expr, treeSolve, insert, remove}