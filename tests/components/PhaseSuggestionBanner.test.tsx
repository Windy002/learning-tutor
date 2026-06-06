import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useStore } from '../../src/store';
import PhaseSuggestionBanner from '../../src/components/PhaseSuggestionBanner';

beforeEach(() => {
  useStore.setState({
    suggestedPhase: null,
    suggestedPhaseReason: '',
    currentPhase: '摸底测试',
    currentTemplate: {
      id: 'learning-tutor',
      name: '学习导师',
      description: '',
      phases: [
        { id: 'assess', name: '摸底测试', color: '', description: '' },
        { id: 'remediate', name: '精准补漏', color: '', description: '' },
        { id: 'iterate', name: '循环迭代', color: '', description: '' },
        { id: 'synthesize', name: '全景收网', color: '', description: '' },
      ],
      buildSystemPrompt: () => '',
    },
  });
});

afterEach(() => {
  cleanup();
});

describe('PhaseSuggestionBanner', () => {
  it('renders nothing when no suggestion', () => {
    const { container } = render(<PhaseSuggestionBanner />);
    expect(container.textContent).toBe('');
  });

  it('shows suggestion and handles confirm', async () => {
    const user = userEvent.setup();
    useStore.setState({
      suggestedPhase: '精准补漏',
      suggestedPhaseReason: '测试原因',
      currentPhase: '摸底测试',
    });

    render(<PhaseSuggestionBanner />);
    expect(screen.getByRole('button', { name: '确认切换' })).toBeTruthy();
    expect(screen.getByText(/测试原因/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '确认切换' }));
    expect(useStore.getState().currentPhase).toBe('精准补漏');
    expect(useStore.getState().suggestedPhase).toBeNull();
  });

  it('handles ignore', async () => {
    const user = userEvent.setup();
    useStore.setState({ suggestedPhase: '全景收网' });

    render(<PhaseSuggestionBanner />);
    await user.click(screen.getByRole('button', { name: '忽略' }));
    expect(useStore.getState().suggestedPhase).toBeNull();
  });
});
