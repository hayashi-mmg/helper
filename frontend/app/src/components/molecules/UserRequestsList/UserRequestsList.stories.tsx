import { Meta, StoryObj } from '@storybook/react';
import { UserRequestsList } from './UserRequestsList';
import { mockRequests } from '../../../mocks/requests';

const meta: Meta<typeof UserRequestsList> = {
  title: 'Molecules/UserRequestsList',
  component: UserRequestsList,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof UserRequestsList>;

export const Default: Story = {
  args: {
    requests: mockRequests,
    isLoading: false,
    totalItems: mockRequests.length,
    currentPage: 1,
    itemsPerPage: 10,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
    onSearch: (keyword) => console.log(`Search for: ${keyword}`),
    onFilter: (filters) => console.log(`Filters applied:`, filters),
    onStatusChange: (requestId, status) => console.log(`Status changed for ${requestId} to ${status}`),
    onRequestClick: (requestId) => console.log(`Request clicked: ${requestId}`),
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    requests: [],
    totalItems: 0,
  },
};

export const FilteredByUser: Story = {
  args: {
    ...Default.args,
    requests: mockRequests.filter(r => r.userId === 'user-1'),
    totalItems: mockRequests.filter(r => r.userId === 'user-1').length,
    userId: 'user-1',
  },
};
