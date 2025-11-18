import { HomepageState, CardConfig, VisibleCard } from '../types';

/**
 * Singleton registry for card configurations
 * Manages card registration and provides filtered, sorted visible cards
 */
class CardRegistry {
  private cards = new Map<string, CardConfig>();

  /**
   * Register a card configuration
   * @param config - Card configuration to register
   * @throws Error if card with same id is already registered
   */
  register(config: CardConfig): void {
    if (this.cards.has(config.id)) {
      throw new Error(`Card with id "${config.id}" is already registered`);
    }
    this.cards.set(config.id, config);
  }

  /**
   * Get all visible cards filtered and sorted by priority
   * @param state - Homepage state to evaluate visibility and priority
   * @returns Array of visible cards sorted by priority (lower = higher priority)
   */
  getVisibleCards(state: HomepageState): VisibleCard[] {
    const visibleCards: VisibleCard[] = [];

    for (const [, config] of this.cards) {
      if (config.shouldShow(state)) {
        visibleCards.push({
          id: config.id,
          priority: config.getPriority(state),
          component: config.component,
        });
      }
    }

    // Sort by priority (lower number = higher priority)
    return visibleCards.sort((a, b) => a.priority - b.priority);
  }

  getRegisteredIds(): string[] {
    return Array.from(this.cards.keys());
  }

  clear(): void {
    this.cards.clear();
  }
}

// Export singleton instance
export const cardRegistry = new CardRegistry();
