import { Meta, StoryObj } from '@storybook/react';
import { ScheduleCalendar } from './ScheduleCalendar';
import { mockCalendarEvents } from '../../../mocks/calendar';

const meta: Meta<typeof ScheduleCalendar> = {
  title: 'Organisms/ScheduleCalendar',
  component: ScheduleCalendar,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ScheduleCalendar>;

export const Day: Story = {
  args: {
    events: mockCalendarEvents,
    isLoading: false,
    initialView: 'day',
    initialDate: new Date('2025-05-12T10:00:00'),
    onDateChange: (date) => console.log(`Date changed to: ${date}`),
    onViewChange: (view) => console.log(`View changed to: ${view}`),
    onEventClick: (event) => console.log(`Event clicked:`, event),
    onDateClick: (date) => console.log(`Date cell clicked: ${date}`),
    onAddEvent: (date) => console.log(`Add event on: ${date}`),
  },
};

export const Week: Story = {
  args: {
    events: mockCalendarEvents,
    isLoading: false,
    initialView: 'week',
    initialDate: new Date('2025-05-12T10:00:00'),
    onDateChange: (date) => console.log(`Date changed to: ${date}`),
    onViewChange: (view) => console.log(`View changed to: ${view}`),
    onEventClick: (event) => console.log(`Event clicked:`, event),
    onDateClick: (date) => console.log(`Date cell clicked: ${date}`),
    onAddEvent: (date) => console.log(`Add event on: ${date}`),
  },
};

export const Month: Story = {
  args: {
    events: mockCalendarEvents,
    isLoading: false,
    initialView: 'month',
    initialDate: new Date('2025-05-12T10:00:00'),
    onDateChange: (date) => console.log(`Date changed to: ${date}`),
    onViewChange: (view) => console.log(`View changed to: ${view}`),
    onEventClick: (event) => console.log(`Event clicked:`, event),
    onDateClick: (date) => console.log(`Date cell clicked: ${date}`),
    onAddEvent: (date) => console.log(`Add event on: ${date}`),
  },
};

export const Loading: Story = {
  args: {
    events: [],
    isLoading: true,
    initialView: 'week',
    initialDate: new Date(),
  },
};
