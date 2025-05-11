import { Meta, StoryObj } from '@storybook/react';
import { AssignedUsersList } from './AssignedUsersList';
import { mockUsers } from '../../../mocks/users';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof AssignedUsersList> = {
  title: 'Molecules/AssignedUsersList',
  component: AssignedUsersList,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AssignedUsersList>;

export const Default: Story = {
  args: {
    users: mockUsers,
    isLoading: false,
    totalItems: mockUsers.length,
    currentPage: 1,
    itemsPerPage: 10,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
    onSearch: (keyword) => console.log(`Search for: ${keyword}`),
    onUserClick: (userId) => console.log(`User clicked: ${userId}`),
  },
};

export const Loading: Story = {
  args: {
    users: [],
    isLoading: true,
    totalItems: 0,
  },
};

export const Empty: Story = {
  args: {
    users: [],
    isLoading: false,
    totalItems: 0,
  },
};
