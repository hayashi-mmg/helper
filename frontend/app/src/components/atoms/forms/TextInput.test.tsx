
import { render, screen, fireEvent } from '../../../test-utils/providers';
import { SearchIcon } from '@chakra-ui/icons';
import TextInput from './TextInput';
import { Component } from 'react';

describe('TextInput Component', () => {
    it('renders with label correctly', () => {
        render(<TextInput label="Username" placeholder="Enter username" />);
        
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    });

    it('renders without label when not provided', () => {
        render(<TextInput placeholder="Enter username" />);
        
        expect(screen.queryByRole('textbox')).toBeInTheDocument();
        expect(screen.queryByText('Username')).not.toBeInTheDocument();
    });

    it('displays helper text when provided', () => {
        render(
            <TextInput 
                label="Email" 
                helperText="We'll never share your email" 
                placeholder="Enter email" 
            />
        );
        
        expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it('displays error message when error is provided', () => {
        render(
            <TextInput 
                label="Password" 
                error="Password is required" 
                placeholder="Enter password" 
            />
        );
        
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('prioritizes error message over helper text', () => {
        render(
            <TextInput 
                label="Email" 
                helperText="We'll never share your email" 
                error="Invalid email format" 
                placeholder="Enter email" 
            />
        );
        
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        expect(screen.queryByText("We'll never share your email")).not.toBeInTheDocument();
    });

    it('handles input changes', () => {
        const handleChange = jest.fn();
        
        render(<TextInput label="Username" onChange={handleChange} placeholder="Enter username" />);
        
        const input = screen.getByPlaceholderText('Enter username');
        fireEvent.change(input, { target: { value: 'john_doe' } });
        
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('renders with left element when provided', () => {
        render(
            <TextInput 
                label="Search" 
                leftElement={<SearchIcon color="gray.500" />}
                placeholder="Search..." 
            />
        );
        
        // SVGアイコンは直接テキストとして取得できないため、InputLeftElementの存在を確認
        expect(document.querySelector('.chakra-input__left-element')).toBeInTheDocument();
    });

    it('renders with right element when provided', () => {
        render(
            <TextInput 
                label="Search" 
                rightElement={<SearchIcon color="gray.500" />}
                placeholder="Search..." 
            />
        );
        
        expect(document.querySelector('.chakra-input__right-element')).toBeInTheDocument();
    });

    it('applies required attribute when isRequired is true', () => {
        render(<TextInput label="Username" isRequired placeholder="Enter username" />);
        
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByRole('textbox').closest('div[role="group"]')).toHaveAttribute('aria-required', 'true');
    });
});