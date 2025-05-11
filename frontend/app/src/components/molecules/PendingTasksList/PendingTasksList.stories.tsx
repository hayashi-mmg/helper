import { Meta, StoryObj } from '@storybook/react';
import { PendingTasksList } from './PendingTasksList';
import { mockTasks } from '../../../mocks/tasks';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof PendingTasksList> = {
  title: 'Molecules/PendingTasksList',
  component: PendingTasksList,
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
type Story = StoryObj<typeof PendingTasksList>;

export const Default: Story = {
  args: {
    tasks: mockTasks.filter(task => task.status !== 'completed'),
    isLoading: false,
    totalItems: mockTasks.filter(task => task.status !== 'completed').length,
    currentPage: 1,
    itemsPerPage: 10,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
    onSearch: (keyword) => console.log(`Search for: ${keyword}`),
    onFilter: (filters) => console.log('Filters applied:', filters),
    onSort: (field, direction) => console.log(`Sort by ${field} ${direction}`),
    onStatusChange: (taskId, status) => console.log(`Task ${taskId} status changed to ${status}`),
    onTaskClick: (taskId) => console.log(`Task clicked: ${taskId}`),
  },
};

export const Loading: Story = {
  args: {
    tasks: [],
    isLoading: true,
    totalItems: 0,
  },
};

export const Empty: Story = {
  args: {
    tasks: [],
    isLoading: false,
    totalItems: 0,
  },
};
