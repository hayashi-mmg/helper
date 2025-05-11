import { Meta, StoryObj } from '@storybook/react';
import { RequestDetailsDisplay } from './RequestDetailsDisplay';
import { mockRequests } from '../../../mocks/requests';

const meta: Meta<typeof RequestDetailsDisplay> = {
  title: 'Molecules/RequestDetailsDisplay',
  component: RequestDetailsDisplay,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RequestDetailsDisplay>;

export const CookingRequest: Story = {
  args: {
    request: mockRequests.find(r => r.id === 'req-001'),
    isLoading: false,
    isUpdating: false,
    isSendingComment: false,
    onStatusChange: (requestId, status) => {
      console.log(`Status changed to ${status} for request ${requestId}`);
    },
    onAddComment: (requestId, comment) => {
      console.log(`New comment added to ${requestId}: ${comment}`);
    },
    onBack: () => console.log('Back button clicked'),
    onViewRecipe: (recipeUrl) => {
      console.log(`View recipe: ${recipeUrl}`);
    },
    onCompleteTask: (requestId) => {
      console.log(`Complete task form opened for ${requestId}`);
    },
  },
};

export const ErrandRequest: Story = {
  args: {
    ...CookingRequest.args,
    request: mockRequests.find(r => r.id === 'req-003'),
  },
};

export const InProgressRequest: Story = {
  args: {
    ...CookingRequest.args,
    request: mockRequests.find(r => r.id === 'req-002'),
  },
};

export const CompletedRequest: Story = {
  args: {
    ...CookingRequest.args,
    request: mockRequests.find(r => r.id === 'req-005'),
  },
};

export const CancelledRequest: Story = {
  args: {
    ...CookingRequest.args,
    request: mockRequests.find(r => r.id === 'req-007'),
  },
};

export const Loading: Story = {
  args: {
    ...CookingRequest.args,
    request: undefined,
    isLoading: true,
  },
};

export const NotFound: Story = {
  args: {
    ...CookingRequest.args,
    request: undefined,
    isLoading: false,
  },
};
