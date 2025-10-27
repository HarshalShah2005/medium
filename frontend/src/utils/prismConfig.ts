import Prism from 'prismjs';

// Import Prism CSS theme
import 'prismjs/themes/prism-tomorrow.css';

// Load languages in the correct order to handle dependencies
// Core languages (no dependencies)
import 'prismjs/components/prism-markup'; // HTML/XML base
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

// Languages with dependencies (load after base languages)
import 'prismjs/components/prism-typescript'; // depends on javascript
import 'prismjs/components/prism-jsx'; // depends on markup, javascript
import 'prismjs/components/prism-tsx'; // depends on jsx, typescript
import 'prismjs/components/prism-scss'; // depends on css

// C family languages (load C first, then C++)
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp'; // depends on c

// Configure Prism
Prism.manual = true; // Disable automatic highlighting

export { Prism };
export default Prism;