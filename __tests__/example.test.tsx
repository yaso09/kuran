import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

describe('Example Test', () => {
    it('adds 1 + 2 to equal 3', () => {
        expect(1 + 2).toBe(3)
    })

    it('renders a heading', () => {
        render(<h1>Hello World</h1>)
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('Hello World')
    })
})
