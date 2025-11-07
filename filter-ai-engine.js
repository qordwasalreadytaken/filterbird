/**
 * FilterPhoenix AI Assistant Backend Integration
 * This module provides the core AI logic for processing natural language
 * requests and generating appropriate filter rules.
 * Rising from the ashes of FilterBird to help users create better filters.
 */

class FilterPhoenixAI {
    constructor() {
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.templates = this.initializeTemplates();
        this.conversationContext = [];
    }

    /**
     * Initialize the knowledge base with PoD-specific information
     */
    initializeKnowledgeBase() {
        return {
            // Item types and their codes
            itemTypes: {
                'runes': ['r01', 'r02', 'r03', 'r04', 'r05', 'r06', 'r07', 'r08', 'r09', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15', 'r16', 'r17', 'r18', 'r19', 'r20', 'r21', 'r22', 'r23', 'r24', 'r25', 'r26', 'r27', 'r28', 'r29', 'r30', 'r31', 'r32', 'r33'],
                'gems': ['gem', 'GEM'],
                'uniques': ['UNI'],
                'sets': ['SET'],
                'rares': ['RARE'],
                'magic': ['MAG'],
                'normal': ['NORM'],
                'superior': ['SUP'],
                'jewelry': ['RIN', 'AMU'],
                'charms': ['CM1', 'CM2', 'CM3'],
                'throwingWeapons': ['7ta', '7tk', '7bk', '9ta', 'tax', 'tkf']
            },

            // Rune tiers for different treatment
            runeTiers: {
                'low': [1, 9],       // El - Fal
                'mid': [10, 15],     // Lem - Pul  
                'midHigh': [16, 25], // Mal - Gul
                'high': [26, 33]     // Vex - Zod
            },

            // Common color codes
            colors: {
                'white': '%WHITE%',
                'gray': '%GRAY%',
                'blue': '%BLUE%',
                'yellow': '%YELLOW%',
                'gold': '%GOLD%',
                'orange': '%ORANGE%',
                'green': '%GREEN%',
                'purple': '%PURPLE%',
                'red': '%RED%',
                'dark_green': '%DARK_GREEN%',
                'tan': '%TAN%'
            },

            // Common keywords and their meanings
            keywords: {
                'hide': 'Create rules that make items invisible',
                'show': 'Create rules that display items',
                'highlight': 'Make items stand out with colors/borders',
                'notify': 'Add sound notifications',
                'junk': 'Low value, common items',
                'valuable': 'High value, rare items',
                'socketed': 'Items with socket holes',
                'ethereal': 'ETH items with enhanced stats',
                'endgame': 'High-level, valuable items only',
                'currency': 'Tradeable items like runes, gems',
                'leveling': 'Items useful while leveling up',
                'itemstyles': 'Advanced styling with borders, icons, sounds',
                'border': 'Visual border around item display',
                'mapicon': 'Icons shown on the minimap',
                'notification': 'Sound and visual alerts'
            },

            // ItemStyle attributes and their functions
            itemStyleAttributes: {
                'MapIcon': 'Icon number shown on minimap (1-99)',
                'MapIconColor': 'Color of the map icon (0-255)',
                'BorderColor': 'Color of item border (0-255)', 
                'BorderSize': 'Thickness of border (1-5)',
                'BackgroundColor': 'Background color behind item (0-255)',
                'NotificationColor': 'Color for notification text',
                'NotificationPriority': 'Importance: LOW, MEDIUM, HIGH',
                'NotificationSound': 'Sound file to play',
                'NotificationSoundPriority': 'Sound importance: LOW, MEDIUM, HIGH'
            },

            // Common sound files for notifications
            soundFiles: {
                'ding': 'Simple notification sound',
                'zelda2': 'Distinctive alert sound',
                'corb1': 'Custom sound variation 1',
                'corb2': 'Custom sound variation 2',
                'corb3': 'Custom sound variation 3'
            }
        };
    }

    /**
     * Initialize filter templates for common scenarios
     */
    initializeTemplates() {
        return {
            basic: {
                description: "A basic filter showing important items with itemstyles",
                rules: [
                    "// Basic FilterPhoenix AI Generated Filter",
                    "// Shows important items, hides junk",
                    "",
                    "// ItemStyle definitions",
                    "ItemStyle[basics]: BorderColor = 4, BorderSize = 1, NotificationColor = WHITE",
                    "ItemStyle[valuable]: MapIcon = 4, BorderColor = 111, BorderSize = 2, BackgroundColor = 197, NotificationColor = PURPLE, NotificationPriority = MEDIUM",
                    "",
                    "// Hide low quality items",
                    "ItemDisplay[NMAG (WP1 OR WP2 OR WP3) QLVL<20]: ",
                    "ItemDisplay[NMAG EQ1 QLVL<15]: ",
                    "",
                    "// Show all runes with notification", 
                    "ItemDisplay[RUNE]: %PURPLE%~ %NAME% ~ <<valuable>>",
                    "",
                    "// Show uniques with special styling",
                    "ItemDisplay[UNI]: %GOLD%* %NAME% * <<valuable>>",
                    "",
                    "// Show sets",
                    "ItemDisplay[SET]: %GREEN%+ %NAME% + <<basics>>"
                ]
            },

            endgame: {
                description: "Strict endgame filter showing only valuable items",
                rules: [
                    "// Endgame FilterPhoenix AI Generated Filter",
                    "// Only shows high-value items",
                    "",
                    "// High runes only (Mal+)",
                    "ItemDisplay[RUNE>=16]: %PURPLE%« %NAME% »%CONTINUE%",
                    "",
                    "// Uniques and sets",
                    "ItemDisplay[UNI]: %GOLD%* %NAME% *%CONTINUE%",
                    "ItemDisplay[SET]: %GREEN%+ %NAME% +%CONTINUE%",
                    "",
                    "// Perfect gems only",
                    "ItemDisplay[GEM=5]: %WHITE%° %NAME% °%CONTINUE%",
                    "",
                    "// High-value rare jewelry",
                    "ItemDisplay[RARE (RIN OR AMU) ILVL>=30]: %YELLOW%~ %NAME% ~%CONTINUE%",
                    "",
                    "// 4+ socket items",
                    "ItemDisplay[SOCK>=4]: %WHITE%[%SOCK%] %NAME% %CONTINUE%",
                    "",
                    "// Show all other items with default display",
                    "ItemDisplay[]: %NAME%"
                ]
            },

            runes: {
                description: "Comprehensive rune display with tiers and itemstyles",
                rules: [
                    "// Enhanced Rune Display Rules with ItemStyles",
                    "",
                    "// ItemStyle definitions for different rune tiers",
                    "ItemStyle[highrunes]: MapIcon = 75, MapIconColor = 5, BorderColor = 111, BorderSize = 3, BackgroundColor = 75, NotificationColor = PURPLE, NotificationPriority = HIGH, NotificationSound = ding, NotificationSoundPriority = HIGH",
                    "ItemStyle[midhighrunes]: MapIcon = 75, MapIconColor = 4, BorderColor = 197, BorderSize = 2, BackgroundColor = 75, NotificationColor = ORANGE, NotificationPriority = MEDIUM",
                    "ItemStyle[midrunes]: MapIcon = 75, MapIconColor = 3, BorderColor = 15, BorderSize = 1, BackgroundColor = 75, NotificationColor = YELLOW",
                    "ItemStyle[lowrunes]: BorderColor = 4, BorderSize = 1, NotificationColor = WHITE",
                    "",
                    "// High Runes (Vex+) - Bright purple with sound",
                    "ItemDisplay[RUNE>=26]: %PURPLE%« %NAME% » <<highrunes>>",
                    "",
                    "// Mid-High Runes (Mal-Gul) - Orange with border", 
                    "ItemDisplay[RUNE>=16 RUNE<=25]: %ORANGE%º %NAME% º <<midhighrunes>>",
                    "",
                    "// Mid Runes (Lem-Pul) - Yellow",
                    "ItemDisplay[RUNE>=10 RUNE<=15]: %YELLOW%° %NAME% ° <<midrunes>>",
                    "",
                    "// Low Runes - White with simple display",
                    "ItemDisplay[RUNE<10]: %WHITE%%NAME% <<lowrunes>>",
                    "",
                    "// Show all other items",
                    "ItemDisplay[]: %NAME%"
                ]
            },

            hiding: {
                description: "Comprehensive junk hiding rules",
                rules: [
                    "// Junk Item Hiding Rules",
                    "",
                    "// Hide low level normal weapons",
                    "ItemDisplay[NMAG WEAPON QLVL<2]: ",
                    "",
                    "// Hide low level normal armor", 
                    "ItemDisplay[NMAG ARMOR QLVL<2]: ",
                    "",
                    "// Hide inferior items", 
                    "ItemDisplay[(ARMOR OR WEAPON) INF]:",
                    "",
                    "// Hide most magic items except jewelry and charms",
                    "ItemDisplay[MAG !RIN !AMU !CM1 !CM2 !CM3 QLVL<25]: ",
                    "",
                    "// Hide low level rare weapons",
                    "ItemDisplay[RARE WEAPON QLVL<30]: ",
                    "",
                    "// Hide inferior items",
                    "ItemDisplay[INF]: ",
                    "",
                    "// Hide low gold stacks",
                    "ItemDisplay[GOLD<500]: "
                ]
            },

            currency: {
                description: "Comprehensive currency items filter with itemstyles",
                rules: [
                    "// Currency Items - Valuable Trading Items",
                    "",
                    "// ItemStyle definitions for currency",
                    "ItemStyle[gems]: MapIcon = 76, MapIconColor = 4, BorderColor = 197, BorderSize = 1, BackgroundColor = 75, NotificationColor = WHITE",
                    "ItemStyle[runes]: MapIcon = 75, MapIconColor = 5, BorderColor = 111, BorderSize = 2, BackgroundColor = 75, NotificationColor = PURPLE, NotificationPriority = HIGH",
                    "ItemStyle[orbs]: MapIcon = 77, MapIconColor = 3, BorderColor = 111, BorderSize = 2, BackgroundColor = 203, NotificationColor = ORANGE, NotificationPriority = MEDIUM",
                    "ItemStyle[scrolls]: BorderColor = 15, BorderSize = 1, NotificationColor = BLUE",
                    "",
                    "// Perfect gems",
                    "ItemDisplay[GEMLEVEL=5]: %WHITE%° %NAME% ° <<gems>>",
                    "",
                    "// Flawless gems", 
                    "ItemDisplay[GEMLEVEL=4]: %WHITE%° %NAME% ° <<gems>>",
                    "",
                    "// All runes with enhanced styling",
                    "ItemDisplay[RUNE]: %PURPLE%~ %NAME% ~ <<runes>>",
                    "",
                    "// Orb of Corruption",
                    "ItemDisplay[obc]: %RED%« %NAME% » <<orbs>>",
                    "",
                    "// Orb of Alteration", 
                    "ItemDisplay[oba]: %ORANGE%« %NAME% » <<orbs>>",
                    "",
                    "// Town Portal and Identify scrolls",
                    "ItemDisplay[tsc OR isc]: %BLUE%%NAME% <<scrolls>>",
                    "",
                    "// Show all other items",
                    "ItemDisplay[]: %NAME%"
                ]
            },

            itemstyles: {
                description: "Advanced filter with comprehensive itemstyles",
                rules: [
                    "// Advanced ItemStyle Definitions",
                    "",
                    "// High-value unique style",
                    "ItemStyle[valuables]: MapIcon = 4, MapIconColor = 5, BorderColor = 111, BorderSize = 2, BackgroundColor = 197, NotificationColor = PURPLE, NotificationPriority = HIGH, NotificationSound = zelda2, NotificationSoundPriority = HIGH",
                    "",
                    "// Rune styles by tier",
                    "ItemStyle[highrunes]: MapIcon = 75, MapIconColor = 5, BorderColor = 111, BorderSize = 3, BackgroundColor = 75, NotificationColor = PURPLE, NotificationPriority = HIGH, NotificationSound = ding, NotificationSoundPriority = HIGH",
                    "ItemStyle[midrunes]: MapIcon = 75, MapIconColor = 4, BorderColor = 197, BorderSize = 2, BackgroundColor = 75, NotificationColor = ORANGE, NotificationPriority = MEDIUM",
                    "ItemStyle[lowrunes]: MapIcon = 75, MapIconColor = 3, BorderColor = 15, BorderSize = 1, NotificationColor = YELLOW",
                    "",
                    "// Gear styles",
                    "ItemStyle[equipment]: BorderColor = 4, BorderSize = 1, BackgroundColor = 15",
                    "ItemStyle[notify]: NotificationColor = WHITE, NotificationPriority = LOW",
                    "",
                    "// High Runes (Vex+)",
                    "ItemDisplay[RUNE>=26]: %PURPLE%« %NAME% » <<highrunes>>",
                    "",
                    "// Mid Runes (Lem-Gul)",
                    "ItemDisplay[RUNE>=10 RUNE<=25]: %ORANGE%° %NAME% ° <<midrunes>>",
                    "",
                    "// Low Runes",
                    "ItemDisplay[RUNE<10]: %YELLOW%%NAME% <<lowrunes>>",
                    "",
                    "// Valuable uniques", 
                    "ItemDisplay[UNI]: %GOLD%* %NAME% * <<valuables>>",
                    "",
                    "// Sets with notification",
                    "ItemDisplay[SET]: %GREEN%+ %NAME% + <<notify>>",
                    "",
                    "// Show all other items",
                    "ItemDisplay[]: %NAME%"
                ]
            }
        };
    }

    /**
     * Main method to process user input and generate filter rules
     */
    async processRequest(userInput, currentFilter = '') {
        const request = this.parseUserInput(userInput);
        const response = await this.generateResponse(request, currentFilter);
        
        this.conversationContext.push({
            user: userInput,
            assistant: response,
            timestamp: new Date()
        });

        return response;
    }

    /**
     * Parse user input to understand intent and extract entities
     */
    parseUserInput(input) {
        const lowercaseInput = input.toLowerCase();
        
        // Check if user provided a filter line to explain
        const filterLineMatch = input.match(/ItemDisplay\[[^\]]*\]:[^\n]*/);
        
        const request = {
            intent: this.extractIntent(lowercaseInput),
            entities: this.extractEntities(lowercaseInput),
            modifiers: this.extractModifiers(lowercaseInput),
            originalInput: input,
            filterLine: filterLineMatch ? filterLineMatch[0] : null
        };

        // Override intent if we found a filter line and user is asking about it
        if (filterLineMatch && (lowercaseInput.includes('what does') || lowercaseInput.includes('explain') || lowercaseInput.includes('what is'))) {
            request.intent = 'explain';
        }

        return request;
    }

    /**
     * Extract the main intent from user input
     */
    extractIntent(input) {
        const intentPatterns = {
            'add': ['add', 'how do i add', 'i need to add', 'include', 'insert', 'append'],
            'create': ['create', 'make', 'generate', 'build', 'new'],
            'modify': ['modify', 'change', 'update', 'edit', 'adjust'],
            'hide': ['hide', 'remove', 'exclude', 'filter out'],
            'show': ['show', 'display', 'include', 'highlight'],
            'explain': ['explain', 'what does', 'how does', 'understand', 'what is', 'analyze', 'describe', 'tell me about'],
            'help': ['help', 'how to', 'tutorial', 'guide']
        };

        // Check for filter line explanation patterns first
        if (input.includes('itemdisplay[') && (input.includes('what does') || input.includes('explain') || input.includes('what is'))) {
            return 'explain';
        }

        // Check for add requests with filter lines
        if ((input.includes('add') || input.includes('how do i add') || input.includes('i need to add')) && input.includes('itemdisplay[')) {
            return 'add';
        }

        for (const [intent, patterns] of Object.entries(intentPatterns)) {
            if (patterns.some(pattern => input.includes(pattern))) {
                return intent;
            }
        }

        return 'unknown';
    }

    /**
     * Extract entities (item types, properties, etc.) from input
     */
    extractEntities(input) {
        const entities = {
            itemTypes: [],
            qualities: [],
            properties: [],
            values: []
        };

        // Extract item types
        const itemTypePatterns = {
            'runes': ['rune', 'runes'],
            'gems': ['gem', 'gems'],
            'currency': ['currency', 'trading', 'orb of corruption', 'orb of alteration', 'perfect gem', 'flawless gem', 'obc', 'oba'],
            'uniques': ['unique', 'uniques', 'synthesized'],
            'sets': ['set', 'sets'],
            'jewelry': ['jewelry', 'ring', 'rings', 'amulet', 'amulets'],
            'charms': ['charm', 'charms'],
            'weapons': ['weapon', 'weapons', 'sword', 'axe', 'bow'],
            'armor': ['armor', 'armour', 'helmet', 'boots', 'gloves'],
            'itemstyles': ['itemstyle', 'itemstyles', 'style', 'styles', 'styling'],
            'advanced': ['advanced', 'enhanced', 'professional', 'complex']
        };

        for (const [type, patterns] of Object.entries(itemTypePatterns)) {
            if (patterns.some(pattern => input.includes(pattern))) {
                entities.itemTypes.push(type);
            }
        }

        // Extract qualities
        const qualityPatterns = {
            'normal': ['normal', 'white', 'basic'],
            'magic': ['magic', 'blue'],
            'rare': ['rare', 'yellow'],
            'unique': ['unique', 'brown', 'legendary'],
            'set': ['set', 'green'],
            'socketed': ['socket', 'socketed', 'holes']
        };

        for (const [quality, patterns] of Object.entries(qualityPatterns)) {
            if (patterns.some(pattern => input.includes(pattern))) {
                entities.qualities.push(quality);
            }
        }

        // Extract numeric values
        const numberMatches = input.match(/\d+/g);
        if (numberMatches) {
            entities.values = numberMatches.map(Number);
        }

        return entities;
    }

    /**
     * Extract modifiers (colors, sounds, etc.)
     */
    extractModifiers(input) {
        const modifiers = {
            colors: [],
            effects: [],
            intensity: 'normal'
        };

        // Extract colors
        const colorPatterns = Object.keys(this.knowledgeBase.colors);
        for (const color of colorPatterns) {
            if (input.includes(color)) {
                modifiers.colors.push(color);
            }
        }

        // Extract effects
        const effectPatterns = {
            'sound': ['sound', 'notification', 'alert', 'beep', 'ding', 'chime'],
            'border': ['border', 'outline', 'frame', 'edge'],
            'bright': ['bright', 'brilliant', 'vivid', 'glow', 'highlight'],
            'large': ['large', 'big', 'size', 'thick'],
            'icon': ['icon', 'symbol', 'emoji', 'map icon', 'mapicon'],
            'background': ['background', 'backdrop', 'fill'],
            'priority': ['priority', 'important', 'urgent'],
            'mapicon': ['map icon', 'mapicon', 'minimap']
        };

        for (const [effect, patterns] of Object.entries(effectPatterns)) {
            if (patterns.some(pattern => input.includes(pattern))) {
                modifiers.effects.push(effect);
            }
        }

        // Extract intensity
        if (input.includes('very') || input.includes('extremely') || input.includes('bright')) {
            modifiers.intensity = 'high';
        } else if (input.includes('subtle') || input.includes('slight')) {
            modifiers.intensity = 'low';
        }

        return modifiers;
    }

    /**
     * Generate response based on parsed request
     */
    async generateResponse(request, currentFilter) {
        const { intent, entities, modifiers, filterLine } = request;

        let response = {
            message: '',
            filter: '',
            suggestions: [],
            explanation: ''
        };

        // If we have a filter line to explain, prioritize that
        if (filterLine && (intent === 'explain' || request.originalInput.toLowerCase().includes('what does'))) {
            return this.explainFilterLine(filterLine);
        }

        switch (intent) {
            case 'add':
                // Extract the filter line from the request
                const filterLineMatch = request.originalInput.match(/ItemDisplay\[.*?\]:\s*.*$/);
                const filterLine = filterLineMatch ? filterLineMatch[0] : currentFilter;
                response = this.handleAddToFilterRequest(filterLine, request.originalInput);
                break;
            case 'create':
                response = this.handleCreateRequest(entities, modifiers);
                break;
            case 'hide':
                response = this.handleHideRequest(entities, modifiers, currentFilter);
                break;
            case 'show':
                response = this.handleShowRequest(entities, modifiers, currentFilter);
                break;
            case 'modify':
                response = this.handleModifyRequest(entities, modifiers, currentFilter);
                break;
            case 'explain':
                response = this.handleExplainRequest(request.filterLine || currentFilter);
                break;
            default:
                response = this.handleUnknownRequest(request);
        }

        return response;
    }

    /**
     * Handle create filter requests
     */
    handleCreateRequest(entities, modifiers) {
        if (entities.itemTypes.length === 0) {
            // Create basic filter
            return {
                message: "I'll create a basic filter for you! This will show important items while hiding common junk.",
                filter: this.ensureProperFilterTermination(this.templates.basic.rules.join('\n')),
                suggestions: [
                    "Customize rune display colors",
                    "Add socket-based filtering", 
                    "Hide specific item types",
                    "Add sound notifications"
                ]
            };
        }

        // Create specific filter based on entities
        // Check for itemstyles request
        if (entities.itemTypes.includes('itemstyles') || entities.itemTypes.includes('advanced')) {
            return {
                message: "I'll create an advanced filter with comprehensive itemstyles! This includes map icons, borders, background colors, and notification sounds.",
                filter: this.ensureProperFilterTermination(this.templates.itemstyles.rules.join('\n')),
                suggestions: [
                    "Customize map icon colors",
                    "Add more notification sounds",
                    "Create custom style definitions",
                    "Fine-tune border and background colors"
                ]
            };
        }
        
        // Check for currency first (more specific than individual items)
        if (entities.itemTypes.includes('currency')) {
            return {
                message: "I'll create a currency filter showing valuable trading items like perfect gems, orb of corruption, orb of alteration, and runes with enhanced itemstyles!",
                filter: this.ensureProperFilterTermination(this.templates.currency.rules.join('\n')),
                suggestions: [
                    "Add gem quality filtering",
                    "Customize rune display",
                    "Include additional orbs",
                    "Add hiding rules for junk"
                ]
            };
        }
        
        if (entities.itemTypes.includes('runes')) {
            return {
                message: "I'll create a comprehensive rune filter with different tiers and advanced itemstyles including map icons and notification sounds!",
                filter: this.ensureProperFilterTermination(this.templates.runes.rules.join('\n')),
                suggestions: [
                    "Add different notification sounds",
                    "Customize color schemes",
                    "Add currency item rules",
                    "Include gem filtering"
                ]
            };
        }

        // Generate custom filter based on entities
        const rules = this.generateCustomRules(entities, modifiers);
        return {
            message: `I've created a custom filter based on your request for ${entities.itemTypes.join(', ')}!`,
            filter: this.ensureProperFilterTermination(rules.join('\n')),
            suggestions: [
                "Add hiding rules for junk items",
                "Customize display colors",
                "Add more item categories",
                "Include socket filtering"
            ]
        };
    }

    /**
     * Handle hide item requests
     */
    handleHideRequest(entities, modifiers, currentFilter) {
        const hideRules = this.generateHideRules(entities, modifiers);
        const newFilter = currentFilter ? currentFilter + '\n\n' + hideRules.join('\n') : hideRules.join('\n');
        
        return {
            message: `I've added hiding rules to remove ${entities.itemTypes.join(', ')} from your display!`,
            filter: this.ensureProperFilterTermination(newFilter),
            suggestions: [
                "Add exceptions for valuable items",
                "Include level-based hiding",
                "Add ethereal item exceptions",
                "Hide more item categories"
            ]
        };
    }

    /**
     * Handle show item requests
     */
    handleShowRequest(entities, modifiers, currentFilter) {
        const showRules = this.generateShowRules(entities, modifiers);
        const newFilter = currentFilter ? currentFilter + '\n\n' + showRules.join('\n') : showRules.join('\n');
        
        return {
            message: `I've added display rules to highlight ${entities.itemTypes.join(', ')}!`,
            filter: this.ensureProperFilterTermination(newFilter),
            suggestions: [
                "Customize colors and effects",
                "Add notification sounds",
                "Include quality-based filtering",
                "Add more display categories"
            ]
        };
    }

    /**
     * Generate custom rules based on entities and modifiers
     */
    generateCustomRules(entities, modifiers) {
        const rules = [`// Custom FilterPhoenix AI Generated Rules`, ''];
        const useItemStyles = modifiers.effects.includes('border') || modifiers.effects.includes('sound') || 
                            modifiers.effects.includes('icon') || modifiers.effects.includes('background') ||
                            entities.itemTypes.includes('itemstyles') || entities.itemTypes.includes('advanced');

        if (useItemStyles) {
            rules.push(`// ItemStyle definitions`);
            rules.push(`ItemStyle[custom]: BorderColor = 111, BorderSize = 2, NotificationColor = WHITE`);
            if (modifiers.effects.includes('sound')) {
                rules.push(`ItemStyle[customsound]: BorderColor = 111, BorderSize = 2, NotificationColor = PURPLE, NotificationSound = ding, NotificationPriority = MEDIUM`);
            }
            if (modifiers.effects.includes('icon')) {
                rules.push(`ItemStyle[customicon]: MapIcon = 4, MapIconColor = 5, BorderColor = 111, BorderSize = 2`);
            }
            rules.push('');
        }

        for (const itemType of entities.itemTypes) {
            const color = modifiers.colors[0] || 'white';
            const colorCode = this.knowledgeBase.colors[color];
            const styleTag = useItemStyles ? ' <<custom>>' : '%CONTINUE%';
            
            switch (itemType) {
                case 'runes':
                    rules.push(`// Show all runes`);
                    rules.push(`ItemDisplay[RUNE]: ${colorCode}%NAME%${styleTag}`);
                    break;
                case 'uniques':
                    rules.push(`// Show unique items`);
                    rules.push(`ItemDisplay[UNI]: ${colorCode}* %NAME% *${styleTag}`);
                    break;
                case 'jewelry':
                    rules.push(`// Show jewelry`);
                    rules.push(`ItemDisplay[RIN OR AMU]: ${colorCode}~ %NAME% ~${styleTag}`);
                    break;
                case 'gems':
                    rules.push(`// Show gems`);
                    rules.push(`ItemDisplay[GEM]: ${colorCode}° %NAME% °${styleTag}`);
                    break;
                case 'currency':
                    rules.push(`// Currency Items - Valuable Trading Items`);
                    rules.push(`// Perfect gems`);
                    rules.push(`ItemDisplay[GEM=5]: %WHITE%° %NAME% °${styleTag}`);
                    rules.push(`// Flawless gems`);
                    rules.push(`ItemDisplay[GEM=4]: %WHITE%° %NAME% °${styleTag}`);
                    rules.push(`// All runes`);
                    rules.push(`ItemDisplay[RUNE]: %PURPLE%~ %NAME% ~${styleTag}`);
                    rules.push(`// Orb of Corruption`);
                    rules.push(`ItemDisplay[obc]: %RED%« %NAME% »${styleTag}`);
                    rules.push(`// Orb of Alteration`);
                    rules.push(`ItemDisplay[oba]: %ORANGE%« %NAME% »${styleTag}`);
                    rules.push(`// Scrolls and potions`);
                    rules.push(`ItemDisplay[tsc OR isc]: %BLUE%%NAME%${styleTag}`);
                    break;
            }
            rules.push('');
        }

        return rules;
    }

    /**
     * Generate hide rules
     */
    generateHideRules(entities, modifiers) {
        const rules = [`// Hide Rules for ${entities.itemTypes.join(', ')}`, ''];

        for (const itemType of entities.itemTypes) {
            switch (itemType) {
                case 'weapons':
                    rules.push(`// Hide low level weapons`);
                    rules.push(`ItemDisplay[NMAG WEAPON QLVL<20]: `);
                    break;
                case 'armor':
                    rules.push(`// Hide low level armor`);
                    rules.push(`ItemDisplay[NMAG ARMOR QLVL<25]: `);
                    break;
                default:
                    rules.push(`// Hide ${itemType}`);
                    rules.push(`ItemDisplay[${itemType.toUpperCase()}]: `);
            }
            rules.push('');
        }

        return rules;
    }

    /**
     * Generate show rules
     */
    generateShowRules(entities, modifiers) {
        const rules = [`// Show Rules for ${entities.itemTypes.join(', ')}`, ''];

        for (const itemType of entities.itemTypes) {
            const color = modifiers.colors[0] || 'white';
            const colorCode = this.knowledgeBase.colors[color];
            
            // Map item types to correct Path of Diablo keywords
            const itemKeywordMap = {
                'uniques': 'UNI',
                'unique': 'UNI',
                'runes': 'RUNE',
                'rune': 'RUNE',
                'sets': 'SET',
                'set': 'SET',
                'magic': 'MAG',
                'rare': 'RARE',
                'normal': 'NMAG',
                'base': 'NMAG',
                'gems': 'GEM',
                'gem': 'GEM',
                'jewelry': 'RIN OR AMU',
                'rings': 'RIN',
                'ring': 'RIN',
                'amulets': 'AMU',
                'amulet': 'AMU',
                'charms': 'CM1 OR CM2 OR CM3',
                'charm': 'CM1 OR CM2 OR CM3'
            };
            
            const keyword = itemKeywordMap[itemType.toLowerCase()] || itemType.toUpperCase();
            
            rules.push(`// Show ${itemType}`);
            rules.push(`ItemDisplay[${keyword}]: ${colorCode}%NAME% %CONTINUE%`);
            rules.push('');
        }

        return rules;
    }

    /**
     * Handle filter explanation requests
     */
    handleExplainRequest(input) {
        // Check if input is a single filter line
        if (input && input.trim().startsWith('ItemDisplay[')) {
            return this.explainFilterLine(input.trim());
        }
        
        // Check if user is asking about a specific filter line within larger text
        if (input && input.includes('ItemDisplay[')) {
            const filterLineMatch = input.match(/ItemDisplay\[[^\]]*\]:[^\n]*/);
            if (filterLineMatch) {
                return this.explainFilterLine(filterLineMatch[0]);
            }
        }

        if (!input || (!input.includes('ItemDisplay[') && input.trim().length < 10)) {
            return {
                message: "No filter is currently loaded. Load or create a filter first, or provide a specific filter line to explain!",
                suggestions: ["Create a new filter", "Load an existing filter", "Ask about a specific ItemDisplay line"]
            };
        }

        const explanation = this.analyzeFilter(input);
        return {
            message: `Here's what your current filter does:\n\n${explanation}`,
            suggestions: [
                "Modify existing rules",
                "Add new item categories", 
                "Optimize for endgame",
                "Add visual enhancements"
            ]
        };
    }

    /**
     * Explain a specific filter line in detail
     */
    explainFilterLine(filterLine) {
        const explanation = [];
        explanation.push(`🔍 **Filter Line Analysis:**`);
        explanation.push(`\`${filterLine}\`\n`);

        // Parse the filter line
        const match = filterLine.match(/ItemDisplay\[([^\]]*)\]:\s*(.*)/);
        if (!match) {
            return {
                message: "This doesn't appear to be a valid filter line. Filter lines should start with 'ItemDisplay['",
                suggestions: ["Check the syntax", "Provide a complete filter line"]
            };
        }

        const [, conditions, display] = match;
        
        // Explain conditions
        explanation.push(`📋 **Conditions (what items this affects):**`);
        if (conditions.trim() === '') {
            explanation.push(`• **No conditions** - This applies to ALL remaining items`);
        } else {
            explanation.push(...this.explainConditions(conditions));
        }

        explanation.push('');

        // Explain display
        explanation.push(`🎨 **Display (how items appear):**`);
        if (display.trim() === '') {
            explanation.push(`• **Hidden** - Items matching these conditions will be completely hidden`);
        } else {
            explanation.push(...this.explainDisplay(display));
        }

        return {
            message: explanation.join('\n').replace(/\n/g, '<br>'),
            suggestions: [
                "Explain another filter line",
                "Modify this rule",
                "Create similar rules",
                "Add itemstyles to this rule"
            ]
        };
    }

    /**
     * Handle requests to add items to filter lines
     */
    handleAddToFilterRequest(originalLine, itemsToAdd) {
        const result = {
            originalLine: originalLine,
            analyzedItems: [],
            newFilterLine: originalLine
        };

        // Extract items and get their codes
        const items = this.extractItemsToAdd(itemsToAdd);
        const itemCodes = this.getItemCodes(items);
        
        // Prepare analysis
        result.analyzedItems = items.map(item => {
            const codes = itemCodes[item.toLowerCase()] || [];
            return {
                name: item,
                codes: codes,
                found: codes.length > 0
            };
        });

        // Only proceed if we found codes for all items
        const foundItems = result.analyzedItems.filter(item => item.found);
        if (foundItems.length === 0) {
            return {
                message: `Sorry, I couldn't find item codes for: ${items.join(', ')}`,
                suggestions: ["Try different item names", "Check spelling"]
            };
        }

        // Add codes to filter line
        result.newFilterLine = this.addCodesToFilterLine(originalLine, foundItems);

        // Build response message
        let message = `<strong>To add ${items.join(' and ')} to your filter line:</strong><br><br>`;
        
        foundItems.forEach(item => {
            message += `• <strong>${item.name}</strong>: Add "${item.codes.join('" OR "')}"<br>`;
        });

        if (foundItems.length < items.length) {
            const notFound = result.analyzedItems.filter(item => !item.found);
            message += `<br><strong>Could not find codes for:</strong> ${notFound.map(item => item.name).join(', ')}<br>`;
        }

        message += `<br><strong>Updated filter line:</strong><br><code>${result.newFilterLine}</code>`;

        return {
            message: message,
            suggestions: [
                "Add more items to this line",
                "Explain this updated line",
                "Create a new filter line"
            ]
        };
    }

    /**
     * Extract item names from user request
     */
    extractItemsToAdd(request) {
        console.log('extractItemsToAdd called with:', request);
        
        const commonItems = [
            'rings', 'ring', 'amulets', 'amulet', 'gloves', 'boots', 'helmet', 'helm',
            'armor', 'shield', 'belt', 'sword', 'axe', 'mace', 'bow', 'crossbow',
            'staff', 'wand', 'javelin', 'spear', 'polearm', 'dagger', 'knife',
            'short sword', 'long sword', 'broad sword', 'war sword', 'two handed sword',
            'hand axe', 'war axe', 'battle axe', 'large axe', 'broad axe',
            'club', 'war club', 'mace', 'war mace', 'flail', 'war hammer',
            'short bow', 'hunter bow', 'long bow', 'composite bow', 'short battle bow',
            'light crossbow', 'crossbow', 'heavy crossbow', 'repeating crossbow',
            'quilted armor', 'leather armor', 'hard leather armor', 'studded leather',
            'ring mail', 'scale mail', 'chain mail', 'breast plate', 'splint mail',
            'light plate', 'field plate', 'gothic plate', 'full plate mail',
            'buckler', 'small shield', 'large shield', 'kite shield', 'tower shield',
            'cap', 'skull cap', 'helm', 'full helm', 'great helm', 'crown', 'mask',
            'leather gloves', 'heavy gloves', 'chain gloves', 'light gauntlets', 'gauntlets',
            'boots', 'heavy boots', 'chain boots', 'light plated boots', 'greaves',
            'sash', 'light belt', 'belt', 'heavy belt', 'plated belt'
        ];

        const found = [];
        const requestLower = request.toLowerCase();
        console.log('Request in lowercase:', requestLower);

        // Sort by length descending to match longer phrases first
        const sortedItems = commonItems.sort((a, b) => b.length - a.length);

        for (const item of sortedItems) {
            if (requestLower.includes(item) && !found.some(foundItem => foundItem.includes(item) || item.includes(foundItem))) {
                found.push(item);
                console.log('Found item:', item);
            }
        }

        // If nothing found, try to extract manually from common words
        if (found.length === 0) {
            console.log('No items found in common list, trying manual extraction');
            const words = request.toLowerCase().split(/\s+/);
            for (const word of words) {
                if (word.length > 3 && !['this', 'line', 'filter', 'code', 'item', 'how', 'add', 'itemdisplay'].includes(word)) {
                    found.push(word);
                    console.log('Manually extracted word:', word);
                }
            }
        }

        console.log('Final extracted items:', found);
        return found;
    }

    /**
     * Get item codes for given item names
     */
    getItemCodes(itemNames) {
        const itemCodes = {};
        
        // Common item name to code mappings
        const mappings = {
            'ring': ['rin'],
            'rings': ['rin'],
            'amulet': ['amu'],
            'amulets': ['amu'],
            'gloves': ['lgl', 'vgl', 'mgl', 'tgl', 'hgl'],
            'boots': ['lbt', 'vbt', 'mbt', 'tbt', 'hbt'],
            'helmet': ['cap', 'skp', 'hlm', 'fhl', 'ghm', 'crn', 'msk'],
            'helm': ['cap', 'skp', 'hlm', 'fhl', 'ghm', 'crn', 'msk'],
            'armor': ['qui', 'lea', 'hla', 'stu', 'rng', 'scl', 'chn', 'brs', 'spl', 'ltp', 'fld', 'gth', 'ful'],
            'shield': ['buc', 'sml', 'lrg', 'kit', 'tow'],
            'belt': ['sash', 'lbl', 'belt', 'hbl', 'plb'],
            'sword': ['ssd', 'scm', 'sbr', 'flc', 'crs', 'bsd', 'lsd', 'wsd', '2hs', 'clm', 'gis', 'brs', 'war', 'bts'],
            'short sword': ['ssd'],
            'long sword': ['lsd'],
            'broad sword': ['bsd'],
            'war sword': ['wsd'],
            'two handed sword': ['2hs'],
            'axe': ['hax', 'axe', 'lax', 'bax', 'btx', 'gax', 'gar'],
            'hand axe': ['hax'],
            'war axe': ['axe'],
            'battle axe': ['bax'],
            'large axe': ['lax'],
            'broad axe': ['btx'],
            'mace': ['club', 'spc', 'mac', 'mst', 'fla', 'whm'],
            'club': ['club'],
            'war club': ['spc'],
            'war mace': ['mac'],
            'flail': ['fla'],
            'war hammer': ['whm'],
            'bow': ['sbw', 'hbw', 'lbw', 'cbw', 'sbb'],
            'short bow': ['sbw'],
            'hunter bow': ['hbw'],
            'long bow': ['lbw'],
            'composite bow': ['cbw'],
            'short battle bow': ['sbb'],
            'crossbow': ['lxb', 'mxb', 'hxb', 'rxb'],
            'light crossbow': ['lxb'],
            'heavy crossbow': ['hxb'],
            'repeating crossbow': ['rxb'],
            'staff': ['sst', 'lst', 'cst', 'bst', 'wst'],
            'wand': ['wnd', 'ywn', 'bwn', 'gwn'],
            'javelin': ['jav', 'pil', 'spt', 'glv', 'tsp'],
            'spear': ['spr', 'tri', 'brn', 'spt', 'pik'],
            'polearm': ['bar', 'vou', 'scy', 'pax', 'hal', 'wsc']
        };

        for (const itemName of itemNames) {
            const codes = mappings[itemName.toLowerCase()] || [];
            if (codes.length > 0) {
                itemCodes[itemName.toLowerCase()] = codes;
            }
        }

        return itemCodes;
    }

    /**
     * Add item codes to existing filter line
     */
    addCodesToFilterLine(originalLine, itemsWithCodes) {
        // Extract the condition part between [ and ]
        const conditionMatch = originalLine.match(/ItemDisplay\[(.*?)\]:/);
        if (!conditionMatch) {
            return originalLine; // Can't parse the line
        }

        let condition = conditionMatch[1];
        const restOfLine = originalLine.substring(originalLine.indexOf(']:') + 2);

        // Collect all new codes
        const newCodes = [];
        itemsWithCodes.forEach(item => {
            newCodes.push(...item.codes);
        });

        // Add codes to condition
        if (newCodes.length > 0) {
            const codeCondition = newCodes.length === 1 ? newCodes[0] : `(${newCodes.join(' OR ')})`;
            
            // If condition already has parentheses or OR statements, wrap the whole thing
            if (condition.includes('OR') || condition.includes('AND')) {
                condition = `(${condition}) AND (${codeCondition})`;
            } else {
                condition = `${condition} AND (${codeCondition})`;
            }
        }

        return `ItemDisplay[${condition}]:${restOfLine}`;
    }

    /**
     * Explain filter conditions
     */
    explainConditions(conditions) {
        const explanations = [];
        
        // Handle parentheses grouping
        if (conditions.includes('(') && conditions.includes(')')) {
            explanations.push(`• **Grouped conditions**: Uses parentheses to group conditions logically`);
        }
        
        // Split by spaces but keep complex patterns together, including negated conditions
        const parts = conditions.match(/(\([^)]+\)|!\w+[><=]*=?\d*|!\w+|\w+[><=]+\d+|\w+[=]\d+|\w+|OR|AND)/g) || [conditions];

        // Enhanced item codes database - combine hardcoded common ones with dynamic lookup
        const itemCodes = this.getItemCodeDatabase();

        const rarityTypes = {
            'UNI': 'Unique (brown text)',
            'SET': 'Set (green text)', 
            'RARE': 'Rare (yellow text)',
            'MAG': 'Magic (blue text)',
            'NORM': 'Normal/White items',
            'SUP': 'Superior items',
            'INF': 'Inferior items'
        };

        const statCodes = {
            'ALLSK': 'All Skills bonus (+X to All Skills)',
            'STAT76': 'All Skills bonus (+X to All Skills)',
            'AR': 'Attack Rating',
            'DEF': 'Defense',
            'STR': 'Strength requirement or bonus',
            'DEX': 'Dexterity requirement or bonus',
            'LIFE': 'Life bonus',
            'MANA': 'Mana bonus',
            'ILVL': 'Item Level',
            'QLVL': 'Quality Level',
            'SOCK': 'Number of Sockets',
            'ED': 'Enhanced Damage %',
            'FRES': 'Fire Resistance',
            'CRES': 'Cold Resistance', 
            'LRES': 'Lightning Resistance',
            'PRES': 'Poison Resistance',
            'RES': 'All Resistances',
            'FCR': 'Faster Cast Rate',
            'FHR': 'Faster Hit Recovery',
            'FBR': 'Faster Block Rate',
            'IAS': 'Increased Attack Speed',
            'FRW': 'Faster Run/Walk',
            'MFIND': 'Magic Find',
            'GFIND': 'Gold Find',
            'RUNE': 'Rune tier/number',
            'GEM': 'Gem grade/quality',
            'GOLD': 'Gold amount',
            'PRICE': 'Shop price',
            'QTY': 'Quantity/stack size',
            'ETH': 'Ethereal property',
            'WEAPON': 'Any weapon type',
            'ARMOR': 'Any armor type',
            'EQ1': 'Equipment category 1',
            'EQ2': 'Equipment category 2',
            'WP1': 'Weapon category 1',
            'WP2': 'Weapon category 2',
            'WP3': 'Weapon category 3'
        };

        parts.forEach(part => {
            const trimmedPart = part.trim().replace(/[()]/g, ''); // Remove parentheses for analysis
            
            // Special handling for parentheses groups with multiple item codes
            if (part.includes('(') && part.includes(')')) {
                const groupMatch = part.match(/\(([^)]+)\)/);
                if (groupMatch) {
                    const groupContent = groupMatch[1];
                    console.log('Group content:', groupContent); // Debug
                    const itemCodesInGroup = groupContent.split(' OR ').map(code => code.trim());
                    console.log('Item codes in group:', itemCodesInGroup); // Debug
                    
                    const foundCodes = itemCodesInGroup.filter(code => itemCodes[code]);
                    console.log('Found codes:', foundCodes); // Debug
                    console.log('Available itemCodes sample:', Object.keys(itemCodes).slice(0, 10)); // Debug
                    console.log('Total itemCodes count:', Object.keys(itemCodes).length); // Debug
                    
                    // Debug: Check each code individually
                    itemCodesInGroup.forEach(code => {
                        console.log(`Checking code "${code}": ${itemCodes[code] ? 'FOUND' : 'NOT FOUND'}`);
                        if (!itemCodes[code] && typeof bases !== 'undefined') {
                            // Direct metadata lookup
                            const directLookup = Object.entries(bases).find(([name, data]) => data.CODE === code);
                            if (directLookup) {
                                console.log(`Direct metadata lookup for "${code}": ${directLookup[0]}`);
                            }
                        }
                    });
                    
                    if (foundCodes.length > 0) {
                        let groupExplanation = `• **Item Group**: Multiple item types (${foundCodes.length} items detected)`;
                        foundCodes.forEach(code => {
                            const specificItems = this.getSpecificItemsForCode(code, conditions);
                            groupExplanation += `\n  • **${code}**: ${itemCodes[code]}`;
                            if (specificItems.length > 0) {
                                specificItems.forEach(item => {
                                    groupExplanation += `\n    → ${item}`;
                                });
                            }
                        });
                        explanations.push(groupExplanation);
                    } else {
                        // Fallback - try to look up codes directly from metadata
                        console.log('No codes found in itemCodes, trying direct metadata lookup'); // Debug
                        if (typeof bases !== 'undefined') {
                            console.log('bases available for direct lookup, total entries:', Object.keys(bases).length);
                            let foundItems = [];
                            itemCodesInGroup.forEach(code => {
                                // Find in bases
                                Object.entries(bases).forEach(([name, data]) => {
                                    if (data.CODE === code) {
                                        const baseName = name.replace(/_/g, ' ');
                                        foundItems.push(`**${code}**: ${baseName}`);
                                        console.log(`Direct lookup found: ${code} -> ${baseName}`);
                                    }
                                });
                            });
                            console.log('Direct metadata lookup found', foundItems.length, 'items');
                            
                            if (foundItems.length > 0) {
                                let groupExplanation = `• **Item Group**: Multiple item types (${foundItems.length}/${itemCodesInGroup.length} items identified)`;
                                foundItems.forEach(item => {
                                    groupExplanation += `\n  • ${item}`;
                                });
                                explanations.push(groupExplanation);
                                console.log('Added group explanation with', foundItems.length, 'items'); // Debug
                            } else {
                                console.log('No items found even in direct metadata lookup'); // Debug
                            }
                        }
                    }
                }
            }

            // Check for item codes with specific item identification (skip if already in a group)
            if (!part.includes('(') || !part.includes(')')) {
                Object.keys(itemCodes).forEach(code => {
                    if (trimmedPart.includes(code) && !trimmedPart.match(/[><=]/)) {
                        const specificItems = this.getSpecificItemsForCode(code, conditions);
                        let explanation = `• **${code}**: ${itemCodes[code]}`;
                        
                        if (specificItems.length > 0) {
                            explanation += `\n  **→ Specific items this affects:**`;
                            specificItems.forEach(item => {
                                explanation += `\n    • ${item}`;
                            });
                        }
                        
                        explanations.push(explanation);
                    }
                });
            }

            // Check for negated conditions like !ETH, !ID (but not !FILTERLVL which is handled separately)
            if (trimmedPart.startsWith('!') && !trimmedPart.includes('FILTERLVL')) {
                const negatedCondition = trimmedPart.substring(1);
                if (negatedCondition === 'ETH') {
                    explanations.push(`• **!ETH**: NOT Ethereal (excludes ethereal items)`);
                } else if (negatedCondition === 'ID') {
                    explanations.push(`• **!ID**: NOT Identified (only shows unidentified items)`);
                } else if (statCodes[negatedCondition]) {
                    explanations.push(`• **!${negatedCondition}**: NOT ${statCodes[negatedCondition]}`);
                } else {
                    explanations.push(`• **!${negatedCondition}**: NOT ${negatedCondition}`);
                }
            }

            // Check for FILTERLVL conditions (both negated and normal)
            if (trimmedPart.includes('FILTERLVL') || part.includes('FILTERLVL')) {
                const filterMatch = part.match(/(!?)FILTERLVL[>=<!]*(\d+)/);
                if (filterMatch) {
                    const isNegated = filterMatch[1] === '!';
                    const level = filterMatch[2];
                    const explanation = isNegated ? 
                        `• **!FILTERLVL=${level}**: NOT at filter level ${level} (excludes items shown by higher priority rules)` :
                        `• **FILTERLVL=${level}**: At filter level ${level}`;
                    explanations.push(explanation);
                }
            }

            // Check for rarity types
            Object.keys(rarityTypes).forEach(rarity => {
                if (trimmedPart === rarity) {
                    explanations.push(`• **${rarity}**: ${rarityTypes[rarity]}`);
                }
            });

            // Check for stat conditions with values
            Object.keys(statCodes).forEach(stat => {
                const statMatch = trimmedPart.match(new RegExp(`^${stat}([><=]+)(\\d+)$`));
                if (statMatch) {
                    const [, operator, value] = statMatch;
                    const opText = operator === '>' ? 'greater than' : 
                                  operator === '<' ? 'less than' : 
                                  operator === '>=' ? 'greater than or equal to' :
                                  operator === '<=' ? 'less than or equal to' : 'equal to';
                    explanations.push(`• **${stat}${operator}${value}**: ${statCodes[stat]} ${opText} ${value}`);
                }
                
                const eqMatch = trimmedPart.match(new RegExp(`^${stat}=(\\d+)$`));
                if (eqMatch) {
                    const [, value] = eqMatch;
                    explanations.push(`• **${stat}=${value}**: ${statCodes[stat]} equal to ${value}`);
                }
            });

            // Check for logical operators
            if (trimmedPart === 'OR') {
                explanations.push(`• **OR**: Either condition can be true`);
            }
            if (trimmedPart === 'AND') {
                explanations.push(`• **AND**: Both conditions must be true`);
            }
        });

        // Only show complex condition fallback if we have very few explanations
        if (explanations.length === 0) {
            explanations.push(`• **Complex condition**: ${conditions}`);
            explanations.push(`  This uses advanced filter syntax that may include multiple item types or conditions`);
        }

        // Add contextual explanation for common combinations
        if (conditions.includes('aq2') && conditions.includes('cq2')) {
            explanations.push(`• **Context**: This targets both arrows and crossbow bolts - all projectile ammunition for ranged weapons`);
        }

        // Add line breaks between each bullet point for better readability
        return explanations.map(exp => exp + '\n\n').flat();
    }

    /**
     * Get item code database - combines hardcoded common items with dynamic lookup from item_metadata
     */
    getItemCodeDatabase() {
        const itemCodes = {
            // Unique quivers with more detail
            'aq2': 'Arrow Quiver - Contains arrows for bows (+Skills and damage in demand)',
            'cq2': 'Crossbow Bolt Quiver - Contains bolts for crossbows (Keep an eye out for +Skills, Magic Arrow, and pierce)',
            'amu': 'Amulet', 
            'jew': 'Jewel',
            
            // Currency & consumables
            'gld': 'Gold',
            'tsc': 'Town Portal Scroll',
            'isc': 'Identify Scroll',
            'obc': 'Orb of Corruption',
            'oba': 'Orb of Alteration',
            
            // Gems
            'gcv': 'Amethyst', 'gcw': 'Diamond', 'gcg': 'Emerald', 
            'gcr': 'Ruby', 'gcy': 'Topaz', 'gcb': 'Sapphire', 'skz': 'Skull',
            
            // Charms  
            'cm1': 'Small Charm', 'cm2': 'Large Charm', 'cm3': 'Grand Charm',
            
            // Runes (r01-r33)
            'r01': 'El Rune', 'r02': 'Eld Rune', 'r03': 'Tir Rune', 'r04': 'Nef Rune',
            'r05': 'Eth Rune', 'r06': 'Ith Rune', 'r07': 'Tal Rune', 'r08': 'Ral Rune',
            'r09': 'Ort Rune', 'r10': 'Thul Rune', 'r11': 'Amn Rune', 'r12': 'Sol Rune',
            'r13': 'Shael Rune', 'r14': 'Dol Rune', 'r15': 'Hel Rune', 'r16': 'Io Rune',
            'r17': 'Lum Rune', 'r18': 'Ko Rune', 'r19': 'Fal Rune', 'r20': 'Lem Rune',
            'r21': 'Pul Rune', 'r22': 'Um Rune', 'r23': 'Mal Rune', 'r24': 'Ist Rune',
            'r25': 'Gul Rune', 'r26': 'Vex Rune', 'r27': 'Ohm Rune', 'r28': 'Lo Rune',
            'r29': 'Sur Rune', 'r30': 'Ber Rune', 'r31': 'Jah Rune', 'r32': 'Cham Rune',
            'r33': 'Zod Rune'
        };

        // Dynamically add items from bases if available
        if (typeof bases !== 'undefined') {
            console.log('bases is available, total entries:', Object.keys(bases).length);
            let addedCount = 0;
            Object.entries(bases).forEach(([name, data]) => {
                if (data.CODE && !itemCodes[data.CODE]) {
                    // Convert internal name to readable name
                    const readableName = name.replace(/_/g, ' ');
                    itemCodes[data.CODE] = readableName;
                    addedCount++;
                }
            });
            console.log('Added', addedCount, 'items from bases to itemCodes database');
        } else {
            console.log('bases is not available');
        }

        // Add some common item codes as fallback if not found in metadata
        if (!itemCodes['uar']) itemCodes['uar'] = 'Sacred Armor';
        if (!itemCodes['ba5']) itemCodes['ba5'] = 'Avenger Guard';
        if (!itemCodes['2ha']) itemCodes['2ha'] = 'Ogre Maul';

        return itemCodes;
    }

    /**
     * Get specific items that match an item code based on filter conditions
     */
    getSpecificItemsForCode(itemCode, fullConditions) {
        const specificItems = [];
        
        // Use the existing bases global variable
        if (typeof bases === 'undefined') {
            return specificItems;
        }

        // Find the base item name from bases
        let baseName = null;
        Object.entries(bases).forEach(([name, data]) => {
            if (data.CODE === itemCode) {
                baseName = name.replace(/_/g, ' ');
            }
        });

        // Fallback for common item codes if not found in metadata
        if (!baseName && itemCode === 'uar') {
            baseName = 'Sacred Armor';
        }

        if (!baseName) {
            return specificItems;
        }

        // Check what type of items this filter targets
        const isSet = fullConditions.includes('SET');
        const isUnique = fullConditions.includes('UNI');
        const hasAllSkills = fullConditions.includes('ALLSK=1');
        const hasLevelReq = fullConditions.match(/ILVL>(\d+)/);

        // Use the existing items global variable to find matching items
        if (typeof items !== 'undefined') {
            items.forEach(item => {
                if (item.base === baseName || item.basename === baseName) {
                    let matches = true;
                    
                    if (isSet && item.rarity !== 'set') matches = false;
                    if (isUnique && item.rarity !== 'unique') matches = false;
                    
                    if (hasAllSkills && item.all_skills !== 1) matches = false;
                    
                    if (hasLevelReq) {
                        const minLevel = parseInt(hasLevelReq[1]);
                        if (!item.req_level || item.req_level <= minLevel) matches = false;
                    }
                    
                    if (matches && item.name) {
                        specificItems.push(item.name);
                    }
                }
            });
        }

        // Handle special cases for well-known items (ensure these are always detected)
        if (itemCode === 'uar' && baseName === 'Sacred Armor') { // Sacred Armor
            if (isSet) {
                specificItems.push("Immortal King's Soul Cage (IK Armor)");
            }
            if (isUnique) {
                specificItems.push("Templar's Might", "Tyrael's Might");
            }
        }

        if (itemCode === 'aq2') { // Arrow Quiver
            if (isUnique) {
                specificItems.push("Dragonbreath", "Hailstorm", "Ice Shards", "Moonfire");
            }
            // Add general information about arrows
            if (!isSet && !isUnique) {
                specificItems.push("Magic/Rare arrows with enhanced damage, elemental damage, or other properties");
            }
        }

        if (itemCode === 'cq2') { // Crossbow Bolt Quiver  
            if (isUnique) {
                specificItems.push("Bolts of Doom");
            }
            // Add general information about bolts
            if (!isSet && !isUnique) {
                specificItems.push("Magic/Rare crossbow bolts with enhanced damage, elemental damage, or other properties");
            }
        }

        // Add more comprehensive coverage for common bases
        this.addWellKnownItems(itemCode, isSet, isUnique, specificItems);

        return [...new Set(specificItems)]; // Remove duplicates
    }

    /**
     * Add well-known items for common item codes
     */
    addWellKnownItems(itemCode, isSet, isUnique, specificItems) {
        const knownItems = {
            // Helms
            'ba5': { // Avenger Guard
                set: ["Immortal King's Will (IK Helm)"],
                unique: ["Andariel's Visage", "Crown of Ages"]
            },
            
            // Weapons
            '2ha': { // Ogre Maul
                set: ["Immortal King's Stone Crusher (IK Maul)"],
                unique: ["Windhammer", "The Cranium Basher"]
            },
            
            // Rings and Amulets
            'rin': {
                unique: ["Stone of Jordan (SoJ)", "Bul-Kathos' Wedding Band", "The Ring of the Five"]
            },
            'amu': {
                unique: ["Mara's Kaleidoscope", "The Rising Sun", "Highlord's Wrath"]
            },

            // Common armor pieces  
            'ltr': { // Leather Armor
                set: ["Cathan's Mesh"],
                unique: ["Greyform"]
            },
            
            // Gloves
            'hgl': { // Heavy Gloves  
                set: ["Cathan's Grip"],
                unique: ["Bloodfist", "Chance Guards"]
            },
            
            // Popular weapon bases
            'gix': { // Giant Axe
                unique: ["Boneslayer Blade", "Executioner's Justice"]
            },
            
            'clb': { // Club
                unique: ["Felloak", "Stoutnail"]
            }
        };

        if (knownItems[itemCode]) {
            if (isSet && knownItems[itemCode].set) {
                specificItems.push(...knownItems[itemCode].set);
            }
            if (isUnique && knownItems[itemCode].unique) {
                specificItems.push(...knownItems[itemCode].unique);
            }
        }
    }

    /**
     * Explain display formatting
     */
    explainDisplay(display) {
        const explanations = [];

        // Check for color codes
        const colorMatches = display.match(/%[A-Z]+%/g) || [];
        if (colorMatches.length > 0) {
            explanations.push(`• **Colors used**: ${colorMatches.join(', ')}`);
        }

        // Check for special tokens
        if (display.includes('%NAME%')) {
            explanations.push(`• **%NAME%**: Shows the item's name`);
        }
        if (display.includes('%BASENAME%')) {
            explanations.push(`• **%BASENAME%**: Shows the base item type`);
        }
        if (display.includes('%ILVL%')) {
            explanations.push(`• **%ILVL%**: Shows the item level`);
        }
        if (display.includes('%SOCKETS%')) {
            explanations.push(`• **%SOCKETS%**: Shows number of sockets`);
        }
        if (display.includes('%NL%')) {
            explanations.push(`• **%NL%**: Adds a new line for multi-line display`);
        }

        // Check for itemstyles
        const styleMatch = display.match(/<<([^>]+)>>/);
        if (styleMatch) {
            explanations.push(`• **<<${styleMatch[1]}>>**: Applies the '${styleMatch[1]}' itemstyle`);
            explanations.push(`  This adds visual effects like borders, colors, map icons, or sound notifications`);
        }

        // Check for %CONTINUE%
        if (display.includes('%CONTINUE%')) {
            explanations.push(`• **%CONTINUE%**: Continues processing additional filter rules for this item`);
        }

        // Add line breaks between each bullet point for better readability
        return explanations.map(exp => exp + '\n\n').flat();
    }

    /**
     * Analyze filter and provide explanation
     */
    analyzeFilter(filter) {
        const lines = filter.split('\n');
        const rules = lines.filter(line => line.trim().startsWith('ItemDisplay['));
        
        let explanation = `📊 **Filter Analysis:**\n`;
        explanation += `• Total rules: ${rules.length}\n`;
        
        const ruleTypes = {
            show: rules.filter(rule => !rule.includes(': ')).length,
            hide: rules.filter(rule => rule.includes(': ')).length
        };
        
        explanation += `• Show rules: ${ruleTypes.show}\n`;
        explanation += `• Hide rules: ${ruleTypes.hide}\n\n`;
        
        explanation += `🎯 **What it does:**\n`;
        
        if (filter.includes('RUNE')) {
            explanation += `• Displays runes with special formatting\n`;
        }
        if (filter.includes('UNI')) {
            explanation += `• Highlights unique items\n`;
        }
        if (filter.includes('SET')) {
            explanation += `• Shows set items\n`;
        }
        if (filter.includes('QLVL<')) {
            explanation += `• Hides low-level items\n`;
        }
        if (filter.includes('SOCK')) {
            explanation += `• Includes socket-based filtering\n`;
        }
        if (filter.includes('ItemStyle[')) {
            explanation += `• Uses advanced itemstyles for enhanced visuals\n`;
        }
        if (filter.includes('<<')) {
            explanation += `• Applies custom styling effects\n`;
        }
        if (filter.includes('MapIcon')) {
            explanation += `• Shows items on minimap with custom icons\n`;
        }
        if (filter.includes('NotificationSound')) {
            explanation += `• Plays notification sounds for important items\n`;
        }
        if (filter.includes('BorderColor')) {
            explanation += `• Adds colored borders around items\n`;
        }
        
        return explanation;
    }

    /**
     * Handle unknown requests
     */
    handleUnknownRequest(request) {
        return {
            message: `I understand you want to work with: "${request.originalInput}". Here are some things I can help you with:
            
            🔧 **Filter Creation:** "Create a new basic filter", "Make an endgame filter"
            🎨 **Styling:** "Make runes purple", "Add sounds to uniques", "Create itemstyles"
            🗑️ **Hiding Items:** "Hide junk items", "Hide low level gear"
            ✨ **Highlighting:** "Show 4+ socket items", "Highlight rare jewelry"
            🎯 **Advanced Features:** "Add itemstyles", "Create map icons", "Add notification sounds"
            📋 **Explanations:** "Explain this filter rule", "What does this filter do?"
            
            Could you be more specific about what you'd like to do?`,
            suggestions: [
                "Create a basic filter",
                "Hide low quality items", 
                "Add itemstyles support",
                "Create advanced filter with notifications"
            ]
        };
    }

    /**
     * Ensure filter has proper termination with ItemDisplay[]: %NAME%
     */
    ensureProperFilterTermination(filterCode) {
        if (!filterCode) return filterCode;
        
        const lines = filterCode.split('\n');
        const hasValidTermination = lines.some(line => 
            line.trim().match(/^ItemDisplay\[\]\s*:\s*%NAME%/) ||
            line.trim().match(/^ItemDisplay\[\]\s*:\s*$/) && line.includes('// Hide') === false
        );
        
        if (!hasValidTermination) {
            // Check if the last meaningful rule uses %CONTINUE%
            const meaningfulLines = lines.filter(line => 
                line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('')
            );
            
            const lastRule = meaningfulLines[meaningfulLines.length - 1];
            if (lastRule && lastRule.includes('%CONTINUE%')) {
                return filterCode + '\n\n// Show all other items\nItemDisplay[]: %NAME%';
            }
        }
        
        return filterCode;
    }
}

// Export for use in web application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterPhoenixAI;
} else if (typeof window !== 'undefined') {
    window.FilterPhoenixAI = FilterPhoenixAI;
}