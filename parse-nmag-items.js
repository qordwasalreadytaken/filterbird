// Node.js script to parse nmag items and categorize them
const fs = require('fs');

// Read the nmag list
const nmagList = fs.readFileSync('nmag-list.txt', 'utf8')
    .split('\n')
    .map(line => line.replace(/\t+/g, ' ').trim())
    .filter(line => line.length > 0);

// Read item_metadata.js and extract bases object
const metadataContent = fs.readFileSync('data/item_metadata.js', 'utf8');

// Extract the bases object using regex
const basesMatch = metadataContent.match(/var bases = \{([\s\S]*?)\n\};/);
if (!basesMatch) {
    console.error('Could not find bases object');
    process.exit(1);
}

// Parse bases entries
const basesText = basesMatch[1];
const baseEntries = {};

// Match each base entry
const entryRegex = /(\w+):\{([^}]+)\}/g;
let match;
while ((match = entryRegex.exec(basesText)) !== null) {
    const name = match[1].replace(/_/g, ' ');
    const props = match[2];
    
    // Extract properties
    const codeMatch = props.match(/CODE:"([^"]+)"/);
    const typeMatch = props.match(/type:"([^"]+)"/);
    const groupMatch = props.match(/group:"([^"]+)"/);
    const maxSocketsMatch = props.match(/max_sockets:(\d+)/);
    const cl1Match = props.match(/CL1:true/);
    const cl2Match = props.match(/CL2:true/);
    const cl4Match = props.match(/CL4:true/);
    const cl5Match = props.match(/CL5:true/);
    const wp11Match = props.match(/WP11:true/);
    const qualityMatch = props.match(/tier:(\d)/);
    
    if (codeMatch) {
        baseEntries[name] = {
            code: codeMatch[1],
            type: typeMatch ? typeMatch[1] : '',
            group: groupMatch ? groupMatch[1] : '',
            maxSockets: maxSocketsMatch ? parseInt(maxSocketsMatch[1]) : 6,
            isDruid: !!cl1Match,
            isNecroHelm: !!cl2Match,
            isNecroHead: !!cl4Match,
            isAssassin: !!cl5Match,
            isSorcStaff: !!wp11Match,
            tier: qualityMatch ? parseInt(qualityMatch[1]) : 0
        };
    }
}

// Categorize items
const categories = {
    polearms: [],
    swords: [],
    axes: [],
    maces: [],
    staves: [],
    bows: [],
    lightArmor: [],
    heavyArmor: [],
    shieldsGeneric: [],
    shieldsPaladin: [],
    helms: [],
    druidPelts: [],
    necroHeads: [],
    assassinClaws: [],
    sorcOrbs: []
};

const notFound = [];

nmagList.forEach(itemName => {
    const entry = baseEntries[itemName];
    
    if (!entry) {
        notFound.push(itemName);
        return;
    }
    
    const item = {
        name: itemName,
        code: entry.code,
        quality: entry.tier === 3 ? 'elite' : entry.tier === 2 ? 'exceptional' : 'normal'
    };
    
    // Class-specific items
    if (entry.isDruid) {
        categories.druidPelts.push(item);
    } else if (entry.isNecroHead) {
        categories.necroHeads.push(item);
    } else if (entry.isAssassin) {
        categories.assassinClaws.push(item);
    } else if (entry.isSorcStaff && entry.type === 'orb') {
        categories.sorcOrbs.push(item);
    }
    // Weapons
    else if (entry.type === 'polearm') {
        categories.polearms.push(item);
    } else if (entry.type === 'sword') {
        categories.swords.push(item);
    } else if (entry.type === 'axe') {
        categories.axes.push(item);
    } else if (entry.type === 'mace' || entry.type === 'club' || entry.type === 'scep') {
        categories.maces.push(item);
    } else if (entry.type === 'staff') {
        categories.staves.push(item);
    } else if (entry.type === 'bow' || entry.type === 'xbow') {
        categories.bows.push(item);
    }
    // Armor
    else if (entry.group === 'helm') {
        if (entry.isNecroHelm) {
            // Skip barbarian helms, they can't have runewords
        } else {
            categories.helms.push(item);
        }
    } else if (entry.group === 'tors') {
        // Determine if light or heavy based on name
        const lightArmor = ['archon plate', 'dusk shroud', 'wyrmhide', 'mage plate', 'light plate', 
                           'wire fleece', 'boneweave', 'loricated mail', 'scarab husk', 'shadow plate',
                           'breast plate', 'cuirass', 'ring mail'];
        if (lightArmor.some(la => itemName.toLowerCase().includes(la))) {
            categories.lightArmor.push(item);
        } else {
            categories.heavyArmor.push(item);
        }
    } else if (entry.group === 'shield' || entry.type === 'shield') {
        // Determine if paladin shield
        const paladinShields = ['targe', 'rondache', 'akaran', 'protector', 'gilded', 'royal', 'sacred', 'kurast', 'zakarum', 'vortex'];
        if (paladinShields.some(ps => itemName.toLowerCase().includes(ps))) {
            categories.shieldsPaladin.push(item);
        } else {
            categories.shieldsGeneric.push(item);
        }
    }
});

// Output JavaScript arrays
console.log('// Generated NMAG item arrays\n');

Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
        const varName = 'nmag' + category.charAt(0).toUpperCase() + category.slice(1);
        console.log(`const ${varName} = [`);
        items.forEach((item, idx) => {
            const comma = idx < items.length - 1 ? ',' : '';
            console.log(`    { name: "${item.name}", code: "${item.code}", quality: "${item.quality}" }${comma}`);
        });
        console.log('];\n');
    }
});

if (notFound.length > 0) {
    console.log('\n// Items not found in metadata:');
    notFound.forEach(name => console.log('// - ' + name));
}
