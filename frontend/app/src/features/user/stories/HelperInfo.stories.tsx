import { Meta, StoryObj } from '@storybook/react';
import { HelperInfo } from '../components/helper/HelperInfo';
import { mockHelper } from '../../test-utils/test-data';
import { HelperStatus, HelperSkill } from '../types';

const meta: Meta<typeof HelperInfo> = {
  component: HelperInfo,
  title: 'フィーチャー/ユーザー/ヘルパー/ヘルパー情報',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof HelperInfo>;

export const Default: Story = {
  args: {
    helper: mockHelper(),
    isLoading: false,
  },
};

export const ActiveHelper: Story = {
  args: {
    helper: mockHelper({
      status: HelperStatus.ACTIVE,
      skills: [HelperSkill.COOKING, HelperSkill.CLEANING, HelperSkill.ELDERCARE],
      rating: 4.8,
    }),
    isLoading: false,
  },
};

export const InactiveHelper: Story = {
  args: {
    helper: mockHelper({
      status: HelperStatus.INACTIVE,
      skills: [HelperSkill.ERRAND, HelperSkill.CHILDCARE],
      rating: 3.5,
    }),
    isLoading: false,
  },
};

export const OnLeaveHelper: Story = {
  args: {
    helper: mockHelper({
      status: HelperStatus.ONLEAVE,
      skills: [HelperSkill.OTHER],
      rating: 4.0,
    }),
    isLoading: false,
  },
};

export const NoRating: Story = {
  args: {
    helper: mockHelper({
      rating: undefined,
    }),
    isLoading: false,
  },
};

export const NoPhoneNumber: Story = {
  args: {
    helper: mockHelper({
      phoneNumber: undefined,
    }),
    isLoading: false,
  },
};

export const WithAvailability: Story = {
  args: {
    helper: mockHelper({
      availability: {
        monday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '13:00', end: '18:00' }],
        friday: [{ start: '10:00', end: '16:00' }],
      },
    }),
    isLoading: false,
  },
};
