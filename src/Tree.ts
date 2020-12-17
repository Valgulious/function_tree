import {Node} from './Node'
import {LEFT_PARENTHESIS, operators, RIGHT_PARENTHESIS} from './types'
// @ts-ignore
import {treeFromArray, treeToASCII} from '../node_modules/treevis/tree'

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

    //TODO
    insert(value: string | number, level: number, position: number): number {
        if (position > Math.pow(2, level - 1)) {
            return -1
        }

        if (this.root === null) {
            if (level === 1 && position === 1) {
                this.root = new Node(value)
            } else {
                return -1
            }
        }

        let currentNode = this.root
        let localPosition = position
        let currentLevel = 1
        while (level !== currentLevel) {
            const middle = Math.pow(2, level - currentLevel - 1)
            // Если нужна позиция больше чем середина (для текущего уровня)
            if (localPosition > middle) {
                if (currentNode.right === null) {
                    // Если справа пустая Node, но она нам и нужна
                    if (level === currentLevel + 1 && localPosition <= 2) {
                        currentNode.right = new Node(value)
                        return 0
                    }
                    return -1
                }
                localPosition -= middle
                currentNode = currentNode.right
                currentLevel++
            } else {
                if (currentNode.left === null) {
                    if (level === currentLevel + 1) {
                        currentNode.left = new Node(value)
                        return 0
                    }
                    return -1
                }
                currentNode = currentNode.left
                currentLevel++
            }
        }
        currentNode.value = value
        return 0
    }

    //TODO
    remove(level: number, position: number): number {
        if (this.root === null) {
            if (level === 1 && position === 1) {
                return 0
            } else {
                return -1
            }
        }

        let currentNode = this.root
        let parent: Node | null = currentNode
        let localPosition = position
        let currentLevel = 1

        const enum PARENT {
            LEFT = 'LEFT',
            RIGHT = 'RIGHT'
        }

        let direction: PARENT | null = null
        while (level !== currentLevel) {
            const middle = Math.pow(2, level - currentLevel - 1)
            // Если нужна позиция больше чем середина (для текущего уровня)
            if (localPosition > middle) {
                if (currentNode.right === null) {
                    return -1
                }
                localPosition -= middle
                parent = currentNode
                currentNode = currentNode.right
                direction = PARENT.RIGHT
                currentLevel++
            } else {
                if (currentNode.left === null) {
                    return -1
                }
                parent = currentNode
                currentNode = currentNode.left
                direction = PARENT.LEFT
                currentLevel++
            }
        }
        if (direction && direction === PARENT.LEFT) {
            parent.left = null
            return 0
        } else if (direction && direction === PARENT.RIGHT) {
            parent.right = null
            return 0
        } else {
            // deleting root
            this.root = null
        }
        return -1
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
    operatorsPriority.forEach((item, index) => {
        if (item.includes(operator)) {
            return index
        }
    })
    return -1
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

export {expr, treeSolve}