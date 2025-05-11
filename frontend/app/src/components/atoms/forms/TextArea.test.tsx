
import { render, screen, fireEvent } from '../../../test-utils/providers';
import TextArea from './TextArea';
import { Component } from 'react';

describe('TextArea Component', () => {
    it('renders with label correctly', () => {
        render(<TextArea label="Comments" placeholder="Enter your comments" />);
        
        expect(screen.getByText('Comments')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your comments')).toBeInTheDocument();
    });

    it('renders without label when not provided', () => {
        render(<TextArea placeholder="Enter your comments" />);
        
        expect(screen.queryByRole('textbox')).toBeInTheDocument();
        expect(screen.queryByText('Comments')).not.toBeInTheDocument();
    });

    it('displays helper text when provided', () => {
        render(
            <TextArea 
                label="Feedback" 
                helperText="Your feedback is important to us" 
                placeholder="Enter your feedback" 
            />
        );
        
        expect(screen.getByText('Your feedback is important to us')).toBeInTheDocument();
    });

    it('displays error message when error is provided', () => {
        render(
            <TextArea 
                label="Description" 
                error="Description is required" 
                placeholder="Enter description" 
            />
        );
        
        expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('prioritizes error message over helper text', () => {
        render(
            <TextArea 
                label="Feedback" 
                helperText="Your feedback is important to us" 
                error="Feedback must be at least 10 characters" 
                placeholder="Enter your feedback" 
            />
        );
        
        expect(screen.getByText('Feedback must be at least 10 characters')).toBeInTheDocument();
        expect(screen.queryByText('Your feedback is important to us')).not.toBeInTheDocument();
    });

    it('handles input changes', () => {
        const handleChange = jest.fn();
        
        render(<TextArea label="Comments" onChange={handleChange} placeholder="Enter your comments" />);
        
        const textarea = screen.getByPlaceholderText('Enter your comments');
        fireEvent.change(textarea, { target: { value: 'This is a test comment' } });
        
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('applies required attribute when isRequired is true', () => {
        render(<TextArea label="Comments" isRequired placeholder="Enter your comments" />);
        
        expect(screen.getByText('Comments')).toBeInTheDocument();
        expect(screen.getByRole('textbox').closest('div[role="group"]')).toHaveAttribute('aria-required', 'true');
    });
    
    it('applies custom rows attribute', () => {
        render(<TextArea label="Comments" rows={5} placeholder="Enter your comments" />);
        
        expect(screen.getByPlaceholderText('Enter your comments')).toHaveAttribute('rows', '5');
    });
});