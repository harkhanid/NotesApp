package com.dharmikharkhani.notes.service;

/**
 * Demo notes content storage - Edit this file to customize demo account notes
 *
 * FORMATTING RULES:
 * - Use ONLY: <p>, <strong>, <em>, <u>
 * - NO headings, lists, tables, code blocks, or emojis
 * - Keep content in flowing paragraphs
 */
public class DemoNotesContent {

    // ==================== DESIGNER NOTES ====================

    public static final String DESIGNER_COLOR_PALETTE =
            "<p><strong><u>Design System Color Palette</u></strong></p>" +
            "<p><em>Last updated: December 2024</em></p>" +
            "<p>Our color system is built around accessibility, consistency, and brand identity. The primary blue color is our brand anchor, used for all primary actions like buttons, links, and active states. We chose this particular shade of blue because it passes WCAG AAA contrast requirements on white backgrounds and feels modern without being overwhelming.</p>" +
            "<p><strong>Primary Colors</strong></p>" +
            "<p>Our main blue is hex code 335CFF, which we call Blue 500. This is used for primary buttons, links, and focus states throughout the application. For hover states and pressed buttons, we use Blue 700 at hex code 2547D0, which is a darker shade that provides clear visual feedback when users interact with elements. These two blues form the core of our interactive color palette.</p>" +
            "<p><strong>Neutral Grays</strong></p>" +
            "<p>We use a scale of grays from pure white to near-black for backgrounds, borders, and text. White FFFFFF is our primary background color. Gray 100 at F3F5F8 is used for subtle backgrounds like hover states on cards. Gray 600 at 525866 is our primary text color, providing excellent readability while being slightly softer than pure black.</p>" +
            "<p><strong>Semantic Colors</strong></p>" +
            "<p>For success states like successful saves or confirmations, we use a green at 10B981. Errors and destructive actions use red EF4444. Warnings use orange F59E0B. Each of these semantic colors has been tested for accessibility and emotional resonance - green feels positive, red feels cautionary, orange feels alert without being alarming.</p>";

    public static final String DESIGNER_UI_MOCKUPS =
            "<p><strong><u>Mobile Dashboard UI Mockups</u></strong></p>" +
            "<p><em>Figma file: mobile-dashboard-v3.fig</em></p>" +
            "<p>The mobile dashboard represents our first foray into mobile-native design. Unlike the desktop application which has ample screen real estate, mobile requires ruthless prioritization of features and information hierarchy. Every pixel counts when you're working with a three hundred seventy-five pixel wide screen.</p>" +
            "<p><strong>Top Navigation</strong></p>" +
            "<p>The navigation bar is fixed at the top with the NotesApp logo on the left, search icon in the top right, and user avatar next to the search. Keeping navigation persistent ensures users always have access to core functions. The search icon is prominent because search is one of the most frequent mobile actions - users want to quickly find specific notes rather than scrolling through long lists.</p>" +
            "<p><strong>Note List Design</strong></p>" +
            "<p>Notes are displayed in a card-based layout where each card shows the note title in bold eighteen pixel text, two lines of preview text that's truncated with ellipsis, tags shown as colored pills at the bottom, and a timestamp showing when the note was last modified. This compact design lets users scan many notes quickly while still providing enough context to identify the right note.</p>" +
            "<p><strong>Bottom Tab Bar</strong></p>" +
            "<p>The bottom tab bar contains five icons: Home, Shared, Search, Tags, and Settings. The active tab is highlighted in our primary blue color while inactive tabs are gray. Bottom tab bars are iOS standard and feel natural on mobile devices where thumbs rest at the bottom of the screen. We're using this pattern to make the app feel familiar and easy to navigate.</p>";

    public static final String DESIGNER_TYPOGRAPHY =
            "<p><strong><u>Typography Guidelines</u></strong></p>" +
            "<p><em>Design system documentation</em></p>" +
            "<p>Typography is the foundation of our visual design. We use Inter for all UI elements and body text because it's highly readable at all sizes, has excellent unicode support, and renders beautifully on both macOS and Windows. Inter was specifically designed for computer screens with generous spacing and clear letter forms.</p>" +
            "<p><strong>Font Families</strong></p>" +
            "<p>Inter is our primary sans-serif font for everything from buttons to paragraphs. For reading mode where users want a more book-like experience, we offer Noto Serif which has a classical feel while maintaining excellent screen readability. For code blocks and technical content, we use Source Code Pro which is a monospace font designed specifically for programming with clear distinction between similar characters like zero and capital O.</p>" +
            "<p><strong>Type Scale</strong></p>" +
            "<p>Our type scale starts with heading one at thirty-two pixels and seven hundred weight for major page titles. Heading two is twenty-four pixels at seven hundred weight for section headers. Heading three is eighteen pixels at six hundred weight for subsections. Body text is sixteen pixels at four hundred weight, which is our most common text size. Small text for metadata and labels is fourteen pixels at three hundred weight.</p>" +
            "<p>The scale is based on a 1.333 ratio which creates visual rhythm without excessive size jumps. Each level is noticeably different from the next while maintaining harmony across the system.</p>";

    public static final String DESIGNER_USER_RESEARCH =
            "<p><strong><u>Usability Testing Session Results</u></strong></p>" +
            "<p><em>Session conducted December 15, 2024 | Five participants</em></p>" +
            "<p>We conducted our third usability testing session with five participants ranging from brand new users to existing customers who have been using NotesApp for three months. The mix of experience levels helps us identify both onboarding friction and advanced user pain points. Each session lasted forty-five minutes and was conducted remotely via Zoom with screen sharing and recording.</p>" +
            "<p><strong>Navigation Confusion</strong></p>" +
            "<p>Three out of five users struggled to find the settings page. They looked in the top navigation, tried clicking their avatar, and even searched for settings before one user finally discovered the settings icon in the sidebar. This is a critical finding because settings includes important features like password changes and notification preferences. We're adding a more prominent settings icon to the main navigation based on this feedback.</p>" +
            "<p><strong>Tag Management Issues</strong></p>" +
            "<p>Users love the tagging system and use it extensively, but they're frustrated that they can't easily edit or delete tags. One user had created a tag with a typo and couldn't figure out how to rename it. Another user wanted to merge two similar tags but had no way to do it. We're designing a tag management modal where users can see all their tags, rename them, delete unused ones, and merge duplicates.</p>" +
            "<p><strong>Collaboration Discoverability</strong></p>" +
            "<p>Even though collaboration is one of our marquee features, users didn't realize notes could be shared until we explicitly told them about it during the session. The share button exists but it's not visually prominent enough. We're planning to add an onboarding tooltip that highlights the share feature when users create their first few notes, making collaboration more discoverable to new users.</p>";

    public static final String DESIGNER_ICON_LIBRARY =
            "<p><strong><u>Icon System Documentation</u></strong></p>" +
            "<p><em>Using Heroicons v2.0</em></p>" +
            "<p>We standardized on Heroicons for all interface icons because they're open source, comprehensive, and available in both outline and solid styles. The library includes over three hundred icons covering all our use cases from navigation to file types. Heroicons are also optimized as SVGs which means they scale perfectly and load fast.</p>" +
            "<p><strong>Navigation Icons</strong></p>" +
            "<p>For navigation, we use house icon for Home, magnifying glass for Search, tag icon for Tags, gear icon for Settings, and arrow-right-on-rectangle for Logout. All navigation icons use the outline style at twenty-four pixels to keep the sidebar clean and modern. The outline style is less visually heavy than solid icons while still being perfectly recognizable.</p>" +
            "<p><strong>Action Icons</strong></p>" +
            "<p>Action icons include plus icon for adding new notes, pencil for editing, trash for deletion, arrow-up-tray for sharing notes, and archive-box for archiving. These use solid style at twenty pixels because they appear on buttons where the extra visual weight helps them stand out. Solid icons on buttons also provide better click targets and visual affordance.</p>" +
            "<p>Icon consistency is crucial for usability. Users quickly learn that trash means delete and pencil means edit. Changing these conventions would confuse users and slow them down, so we stick with universally recognized symbols.</p>";

    // ==================== WRITER NOTES ====================

    public static final String WRITER_BLOG_POST =
            "<p><strong><u>Blog Post: Getting Started with NotesApp</u></strong></p>" +
            "<p><em>Draft 3 | Target: 1800-2000 words | SEO Keywords: note taking app, productivity</em></p>" +
            "<p>Information overload is real. The average knowledge worker spends nearly two hours every day just searching for and gathering information. That's twenty percent of your work week lost to digital chaos. Between scattered browser tabs, random text files, and sticky notes covering your desk, important information slips through the cracks when you need it most.</p>" +
            "<p>NotesApp solves this problem with elegant simplicity. Instead of trying to be everything to everyone like Notion or overwhelming you with features like Evernote, we do one thing exceptionally well - we help you capture, organize, and find your notes. No complex setup. No steep learning curve. Just open the app and start writing.</p>" +
            "<p>What makes NotesApp different is our focus on speed and simplicity. Notes save instantly as you type. Search finds what you need in milliseconds even with thousands of notes. Tags let you organize flexibly without rigid folder hierarchies. Real-time collaboration means your team can work together seamlessly without version control headaches.</p>" +
            "<p>Getting started takes about fifteen minutes. Create your free account, write your first note, add a few tags to organize it, and you're done. The editor supports rich text formatting with an intuitive toolbar that appears when you need it and hides when you don't. Everything works exactly as you'd expect with familiar keyboard shortcuts and markdown support for power users.</p>" +
            "<p>Our free plan includes one hundred notes and two collaborators per note, which is generous for individual users. When you need more, the Pro plan at nine dollars per month gives you unlimited notes and collaborators plus priority support. Teams get additional admin controls and SSO for fifteen dollars per user per month.</p>";

    public static final String WRITER_CONTENT_CALENDAR =
            "<p><strong><u>Content Calendar Q1 2025</u></strong></p>" +
            "<p><em>Planning for January through March</em></p>" +
            "<p>Our content strategy for Q1 focuses on education and feature awareness. We're launching collaboration and mobile apps this quarter, so content needs to support those launches while continuing to serve existing users with tips and best practices.</p>" +
            "<p><strong>January Content</strong></p>" +
            "<p>Week one in January covers New Year productivity tips, helping users start the year organized. Week two spotlights our real-time collaboration feature which launches mid-month. Week three features a user story from Sarah's product management team. Week four provides keyboard shortcuts and power user tips.</p>" +
            "<p><strong>February Content</strong></p>" +
            "<p>February kicks off with our mobile app beta launch announcement. Week two teaches users how to use note templates which launches on the fifteenth. Week three shares developer workflows and how engineering teams use NotesApp. Week four goes behind the scenes on building the product.</p>" +
            "<p><strong>March Content</strong></p>" +
            "<p>March content supports the public mobile app launch on the fifteenth. We'll create comprehensive mobile app guides, comparison articles showing NotesApp versus competitors, case studies from beta users, and end-of-quarter roundup of all the new features we shipped.</p>";

    public static final String WRITER_SEO_KEYWORDS =
            "<p><strong><u>SEO Keyword Research and Strategy</u></strong></p>" +
            "<p><em>Target keywords for content optimization</em></p>" +
            "<p>Keyword research shows that note taking app gets twenty-seven thousand monthly searches, making it our primary target keyword. Collaborative notes gets eight thousand searches. Online notepad gets twenty-two thousand searches but has high competition from simple tools so we'll focus on differentiation.</p>" +
            "<p>Long-tail keywords are where we can win against established competitors. Best note taking app for students gets thirty-six hundred monthly searches with lower competition. Real-time collaborative document editing gets twelve hundred searches from our exact target audience. Markdown note taking app gets twenty-four hundred searches from technical users who love our keyboard-first approach.</p>" +
            "<p>Content opportunities include creating comparison articles like NotesApp versus Notion that target people actively evaluating tools. Tutorial content like how to use NotesApp for project management helps users discover advanced workflows. Explainer articles about features like markdown versus rich text editor attract users searching for solutions to specific problems.</p>";

    public static final String WRITER_SOCIAL_MEDIA =
            "<p><strong><u>Social Media Content Ideas</u></strong></p>" +
            "<p><em>Twitter, LinkedIn, and Instagram strategy</em></p>" +
            "<p>Social media serves two purposes: building awareness with potential users and engaging existing users. Twitter works well for quick tips and feature announcements. LinkedIn is better for professional use cases and company updates. Instagram can showcase beautiful UI screenshots and behind-the-scenes content.</p>" +
            "<p><strong>Twitter Thread Ideas</strong></p>" +
            "<p>Productivity thread: Five ways to supercharge your productivity with NotesApp. Start with using tags to create context-based workflows. Show how templates eliminate repetitive work. Demonstrate collaboration for team alignment. Share keyboard shortcuts for speed. End with search operators for power users. Each tweet includes a screenshot demonstrating the technique.</p>" +
            "<p><strong>LinkedIn Content</strong></p>" +
            "<p>LinkedIn posts focus on professional use cases. Post about how remote teams use NotesApp to stay aligned across time zones. Share case study about Sarah's product management workflow. Discuss the benefits of real-time collaboration versus email and Slack. Each post should be two to three paragraphs with a professional screenshot or diagram.</p>";

    public static final String WRITER_EMAIL_NEWSLETTER =
            "<p><strong><u>Email Newsletter Draft</u></strong></p>" +
            "<p><em>Target: Bi-weekly updates to users</em></p>" +
            "<p>Subject line options include New Feature: Note Templates Are Here, Boost Your Productivity with These 5 Tips, or Mobile App Beta - You're Invited. Testing shows that specific benefit-driven subject lines outperform generic update announcements by thirty percent in open rates.</p>" +
            "<p>The email body starts with a friendly greeting and one sentence about why we're reaching out. Then we highlight three main items: new features like templates, improvements to existing features like faster search, and upcoming releases like the mobile app. Each item gets two to three sentences explaining what it is and why users should care.</p>" +
            "<p>Key new features this month include note templates that let you create reusable note structures, improved search that's now fifty percent faster, and the mobile app beta launching next week. Templates are especially valuable for users who create the same types of notes repeatedly like meeting notes or project plans.</p>" +
            "<p>We close every newsletter with a call-to-action encouraging users to try the new features or join the mobile beta waitlist. A sign-off from the team makes it feel personal rather than corporate. We include an unsubscribe link in the footer because respecting user preferences builds trust.</p>";

    // ==================== STUDENT NOTES ====================

    public static final String STUDENT_LECTURE_NOTES =
            "<p><strong><u>CS 101: Introduction to Algorithms - Lecture 12</u></strong></p>" +
            "<p><em>Date: December 18, 2024 | Professor: Dr. Emily Smith</em></p>" +
            "<p><em>Topic: Algorithm Complexity Analysis and Big O Notation</em></p>" +
            "<p>Today's lecture covered one of the most fundamental concepts in computer science: understanding how algorithms scale as input size grows. Big O notation gives us a mathematical way to describe algorithm efficiency without worrying about hardware differences or implementation details. We care about the shape of the growth curve, not the exact runtime.</p>" +
            "<p>Professor Smith emphasized that we always analyze worst-case complexity unless explicitly told otherwise. This pessimistic approach ensures our algorithms perform acceptably even with unfavorable inputs. An algorithm that's fast on average but catastrophically slow in edge cases can bring down production systems.</p>" +
            "<p><strong>Common Complexity Classes</strong></p>" +
            "<p>Constant time O(1) means runtime doesn't change regardless of input size, like accessing an array element by index. Logarithmic O(log n) algorithms like binary search cut the problem in half repeatedly, scaling incredibly well even with massive datasets. Linear O(n) algorithms visit each element once, like finding the maximum value in an unsorted array.</p>" +
            "<p>Linearithmic O(n log n) appears in efficient sorting algorithms like merge sort and quicksort. Quadratic O(n squared) comes from nested loops and becomes impractical for large datasets - one million items means one trillion operations. Exponential O(2 to the n) and factorial O(n factorial) are only viable for tiny inputs because they grow explosively.</p>" +
            "<p><strong>Binary Search Example</strong></p>" +
            "<p>We worked through binary search in detail because it beautifully demonstrates logarithmic complexity. Given a sorted array, binary search finds a target value by repeatedly halving the search space. Check the middle element. If it matches the target, done. If the middle element is too small, search the right half. If too large, search the left half. Repeat until found or the search space is empty.</p>" +
            "<p>For an array with one thousand elements, binary search needs at most ten comparisons because log base two of one thousand is approximately ten. For one million elements, only twenty comparisons. This logarithmic scaling is why binary search is so powerful, but it requires the array to be sorted first which itself costs O(n log n) time.</p>" +
            "<p><strong>Homework and Exam Prep</strong></p>" +
            "<p>Homework includes analyzing the complexity of nested loops - remember that two independent loops are O(n plus n) which simplifies to O(n), but nested loops are O(n times n) which is O(n squared). Also practice tracing through binary search with different target values to build intuition. The midterm on December twenty-second will heavily feature complexity analysis, so make sure you can determine Big O by inspection.</p>" +
            "<p>Read CLRS Chapter 3 on Growth of Functions for the mathematical foundations behind asymptotic notation. The textbook goes deeper into the formal definitions using limits and proves why we can drop constants and lower-order terms when expressing complexity.</p>";

    public static final String STUDENT_STUDY_GUIDE =
            "<p><strong><u>CS 101 Final Exam Study Guide</u></strong></p>" +
            "<p><em>Exam Date: December 22, 2024</em></p>" +
            "<p>The final exam covers everything from lectures one through fifteen, with emphasis on algorithms and data structures. Professor Smith said to focus on understanding concepts rather than memorizing code. The exam format is fifty percent multiple choice testing theory, thirty percent short answer applying concepts, and twenty percent coding problems.</p>" +
            "<p><strong>Topics to Review</strong></p>" +
            "<p>Big O notation and complexity analysis is foundational material that appears throughout the exam. Need to understand constant time O(1), logarithmic O(log n), linear O(n), linearithmic O(n log n), and quadratic O(n squared). Practice identifying complexity by analyzing code and counting nested loops. Remember that constants don't matter in Big O and we always use worst case analysis.</p>" +
            "<p>Sorting algorithms include bubble sort which is simple but slow at O(n squared), merge sort which is faster at O(n log n) using divide and conquer, and quicksort which averages O(n log n) but can degrade to O(n squared) with bad pivots. Know when to use each algorithm and be able to trace through examples step by step.</p>" +
            "<p>Data structures section covers arrays, linked lists, stacks, queues, and hash tables. Arrays provide constant time access but fixed size. Linked lists provide dynamic size but linear access time. Stacks are LIFO, queues are FIFO. Hash tables provide average constant time lookup but require good hash functions to avoid collisions.</p>" +
            "<p><strong>Study Schedule</strong></p>" +
            "<p>December nineteenth spend three hours reviewing sorting algorithms with practice problems from the textbook. December twentieth dedicate four hours to data structures, implementing each one from scratch to solidify understanding. December twenty-first do five hours of practice problems covering everything, then review any weak areas identified during practice.</p>";

    public static final String STUDENT_PROJECT_IDEAS =
            "<p><strong><u>Project Ideas for Spring Semester</u></strong></p>" +
            "<p><em>CS 201 requires a semester-long project</em></p>" +
            "<p>The semester project needs to demonstrate full-stack development skills including frontend UI, backend API, and database. Projects should solve a real problem and be complex enough to showcase learning but scoped realistically for a semester timeline. Professor wants to see clean code, good architecture, and thorough documentation.</p>" +
            "<p><strong>Task Management App Idea</strong></p>" +
            "<p>Build a kanban-style task management application using React for the frontend, Node.js with Express for the backend API, and MongoDB for the database. Features include creating tasks with titles and descriptions, organizing tasks into columns like To Do, In Progress, and Done, dragging tasks between columns, and adding due dates with email reminders.</p>" +
            "<p>This project teaches React component design, state management with Redux, REST API design, user authentication with JWT tokens, and database modeling. The kanban interface provides good visual design practice. Task tracking is a real problem many students face so building this is personally useful while learning.</p>" +
            "<p><strong>Recipe Finder App Idea</strong></p>" +
            "<p>Create a recipe search application that integrates with external APIs like Spoonacular or Edamam. Users search by ingredients they have, get recipe suggestions, save favorites, and plan weekly meals. Tech stack includes Python with Flask for backend because working with APIs is cleaner in Python, React for frontend, and PostgreSQL for storing user data and favorites.</p>" +
            "<p>This project demonstrates API integration, handling external data, caching for performance, and building useful search functionality. The meal planning feature adds complexity beyond simple CRUD operations. Recipe finding solves a real daily problem of deciding what to cook.</p>" +
            "<p>After comparing both ideas, leaning toward the task management app because the scope is more controlled and the technology stack aligns better with my existing JavaScript knowledge. Recipe finder is interesting but API integration adds uncertainty about rate limits and data quality.</p>";

    public static final String STUDENT_CAREER_NOTES =
            "<p><strong><u>Summer 2025 Internship Application Tracker</u></strong></p>" +
            "<p><em>Goal: Secure software engineering internship for summer</em></p>" +
            "<p>Internship applications opened in December so I'm already late to the game. Most competitive programs at big tech companies filled their slots by November. Focusing on mid-size tech companies and startups that hire on rolling basis through February. Need to apply to at least fifty companies to get enough interviews for offers.</p>" +
            "<p><strong>Target Companies</strong></p>" +
            "<p>Applied to Google software engineering intern role on December fifteenth but haven't heard back yet. Microsoft Explore Program application submitted December tenth, waiting to hear about first round interview. Meta has a January fifth deadline so need to submit soon. Stripe backend engineering intern position looks perfect and they're still accepting applications.</p>" +
            "<p>Beyond big tech, looking at growth stage startups like Notion, Linear, and Vercel which offer great learning experiences and more direct impact than massive companies. Also applying to local companies for backup options in case remote internships don't work out.</p>" +
            "<p><strong>Interview Preparation Plan</strong></p>" +
            "<p>Target is solving fifty LeetCode problems before interviews start, currently at twenty-three completed. Focusing on medium difficulty problems in arrays, strings, and hash tables which appear most frequently in internship interviews. Need to practice system design basics even though internship interviews usually don't go deep on architecture.</p>" +
            "<p>Behavioral interview prep includes preparing answers for common questions like tell me about yourself, describe a challenging project, and explain a time you worked in a team. Using the STAR method - situation, task, action, result - to structure answers with concrete examples from coursework and side projects.</p>";

    public static final String STUDENT_READING_LIST =
            "<p><strong><u>Winter Break Reading List</u></strong></p>" +
            "<p><em>Books to read over December and January break</em></p>" +
            "<p>Winter break is the perfect time for technical reading without the pressure of assignments and exams. Focusing on books that will make me a better programmer while being interesting enough to read for enjoyment. Mixing purely technical books with broader software engineering topics and one or two non-technical books.</p>" +
            "<p><strong>Clean Code by Robert Martin</strong></p>" +
            "<p>Everyone recommends this book for learning to write maintainable code. Key takeaways so far include making variable names meaningful and self-documenting, keeping functions focused on doing one thing well, writing code that reads like prose so others can understand it easily, and explaining why in comments rather than what since the code should be self-explanatory about what it does. Five out of five stars, wish I'd read this freshman year.</p>" +
            "<p><strong>Designing Data-Intensive Applications by Martin Kleppmann</strong></p>" +
            "<p>Currently reading this one, about halfway through. It's dense but incredibly valuable for understanding how databases work under the hood, why certain design decisions matter for scalability, and how distributed systems handle consistency and availability tradeoffs. The CAP theorem section was eye-opening about impossible tradeoffs in distributed systems.</p>" +
            "<p><strong>The Pragmatic Programmer</strong></p>" +
            "<p>On deck to read next. Heard it's less about specific coding techniques and more about professional software development mindset and practices. Topics include technical debt, rubber duck debugging, and staying curious about technology. Looking forward to the perspective on career-long learning versus just solving the immediate problem.</p>" +
            "<p>Also reading Atomic Habits by James Clear which isn't technical but teaches systems for building good habits. Applying the concepts to establish daily coding practice and regular LeetCode solving as automatic habits rather than relying on motivation.</p>";
}
