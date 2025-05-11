
import { render } from '../../test-utils/providers';
import Layout from './Layout';
import { Component } from 'react';

describe('Layout Component', () => {
    it('renders children correctly', () => {
        const { getByText } = render(
            <Layout>
                <div>Child 1</div>
                <div>Child 2</div>
            </Layout>
        );

        expect(getByText('Child 1')).toBeInTheDocument();
        expect(getByText('Child 2')).toBeInTheDocument();
    });

    it('applies the correct direction', () => {
        const { container } = render(
            <Layout direction="column">
                <div>Child</div>
            </Layout>
        );

        expect(container.firstChild).toHaveStyle('flex-direction: column');
    });

    it('applies the correct spacing', () => {
        const { container } = render(
            <Layout spacing={8}>
                <div>Child</div>
            </Layout>
        );

        expect(container.firstChild).toHaveStyle('gap: 8px');
    });
});