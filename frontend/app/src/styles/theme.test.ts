import theme from './theme';

describe('Theme', () => {
    it('has correct brand colors defined', () => {
        expect(theme.colors.brand).toBeDefined();
        expect(theme.colors.brand[500]).toBe('#0092ff');
    });

    it('has semantic colors defined', () => {
        expect(theme.colors.semantic).toBeDefined();
        expect(theme.colors.semantic.success).toBe('#38A169');
        expect(theme.colors.semantic.error).toBe('#E53E3E');
        expect(theme.colors.semantic.warning).toBe('#DD6B20');
        expect(theme.colors.semantic.info).toBe('#3182CE');
    });

    it('has correct font settings', () => {
        expect(theme.fonts).toBeDefined();
        expect(theme.fonts.heading).toContain('Noto Sans JP');
        expect(theme.fonts.body).toContain('Noto Sans JP');
    });

    it('has button component styles defined', () => {
        expect(theme.components.Button).toBeDefined();
        expect(theme.components.Button.baseStyle).toBeDefined();
        expect(theme.components.Button.variants).toBeDefined();
        expect(theme.components.Button.defaultProps).toBeDefined();
        expect(theme.components.Button.defaultProps.colorScheme).toBe('brand');
    });

    it('has responsive breakpoints defined', () => {
        expect(theme.breakpoints).toBeDefined();
        expect(theme.breakpoints.sm).toBe('30em');
        expect(theme.breakpoints.md).toBe('48em');
        expect(theme.breakpoints.lg).toBe('62em');
        expect(theme.breakpoints.xl).toBe('80em');
        expect(theme.breakpoints['2xl']).toBe('96em');
    });

    it('has global styles applied', () => {
        expect(theme.styles).toBeDefined();
        expect(theme.styles.global).toBeDefined();
    });
});