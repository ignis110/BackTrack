"""
BackTrack Standard Academic Curriculum and Syllabus Repository.
Provides complete structural catalogs for university undergraduate computing programs:
- Bachelor of Computer Applications (BCA) - 6 Semesters
- Bachelor of Technology in Computer Science & Engineering (B.Tech CSE) - 8 Semesters

Includes module topics, credits breakdown (Lecture-Tutorial-Practical),
minimum passing marks, evaluation patterns, and official textbooks.
"""

from typing import Dict, List, Any


BCA_CURRICULUM: Dict[int, List[Dict[str, Any]]] = {
    1: [
        {
            "code": "BCA101",
            "name": "Foundations of Information Technology",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Computer Architecture Fundamentals & Logic Gates",
                "Processor Architectures and Memory Hierarchy",
                "Input/Output Interfacing & Storage Technologies",
                "System Software vs Application Software",
                "Operating System Paradigms & Virtualization"
            ],
            "textbooks": ["Computer Fundamentals by P.K. Sinha", "Introduction to Computers by Peter Norton"]
        },
        {
            "code": "BCA102",
            "name": "Problem Solving with C Programming",
            "credits": 4,
            "ltp": "3-0-2",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Algorithms, Pseudocode & Flowcharts",
                "Data Types, Operators, Expressions & Control Structures",
                "Functions, Storage Classes, Recursion",
                "Arrays, Strings & String Handling Algorithms",
                "Pointers, Dynamic Memory Allocation, Files & Structures"
            ],
            "textbooks": ["Programming in ANSI C by E. Balagurusamy", "Let Us C by Yashavant Kanetkar"]
        },
        {
            "code": "BCA103",
            "name": "Discrete Mathematics",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Set Theory, Relations, Equivalence Relations",
                "Propositional & Predicate Logic, Truth Tables",
                "Combinatorics, Permutations, Combinations & Pigeonhole Principle",
                "Graph Theory, Trees, Planar Graphs, Eulerian & Hamiltonian Circuits",
                "Recurrence Relations & Generating Functions"
            ],
            "textbooks": ["Discrete Mathematics & Its Applications by Kenneth Rosen", "Discrete Mathematical Structures by Kolman"]
        },
        {
            "code": "BCA104",
            "name": "Technical Communication & Professional Ethics",
            "credits": 3,
            "ltp": "2-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Business Writing: Reports, Proposals, Minutes",
                "Oral Presentation Skills & Group Discussion Dynamics",
                "Workplace Ethics, Intellectual Property Rights, Copyrights",
                "Cross-Cultural Corporate Communication"
            ],
            "textbooks": ["Technical Communication by Meenakshi Raman & Sangeeta Sharma"]
        }
    ],
    2: [
        {
            "code": "BCA201",
            "name": "Object-Oriented Programming with C++",
            "credits": 4,
            "ltp": "3-0-2",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Principles of OOP: Encapsulation, Abstraction, Polymorphism",
                "Classes, Constructors, Destructors, Copy Constructors",
                "Operator Overloading & Type Conversions",
                "Inheritance: Single, Multiple, Hierarchical, Virtual Base Classes",
                "Virtual Functions, Pure Virtual Functions, Abstract Classes, Templates & Exception Handling"
            ],
            "textbooks": ["Object Oriented Programming with C++ by E. Balagurusamy"]
        },
        {
            "code": "BCA202",
            "name": "Digital Logic and Computer Design",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Number Systems, Complements, Binary Arithmetic",
                "Boolean Algebra, De Morgan's Laws, Karnaugh Maps",
                "Combinational Logic: Adders, Subtractors, Encoders, Multiplexers",
                "Sequential Logic: Flip-Flops (SR, JK, D, T), Counters, Registers",
                "Memory Units: RAM, ROM, Programmable Logic Arrays"
            ],
            "textbooks": ["Digital Design by M. Morris Mano"]
        },
        {
            "code": "BCA203",
            "name": "Numerical Analysis & Statistical Techniques",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Roots of Algebraic & Transcendental Equations (Bisection, Newton-Raphson)",
                "Interpolation (Newton's Forward/Backward, Lagrange)",
                "Numerical Integration (Trapezoidal, Simpson's 1/3 and 3/8 Rules)",
                "Probability Distributions: Binomial, Poisson, Normal",
                "Sampling Theory, Chi-Square Test, Hypothesis Testing"
            ],
            "textbooks": ["Numerical Methods for Scientists and Engineers by S.S. Sastry"]
        },
        {
            "code": "BCA204",
            "name": "Principles of Management & Financial Accounting",
            "credits": 3,
            "ltp": "3-0-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Management Theories & Functions: Planning, Organizing, Staffing, Controlling",
                "Double Entry Bookkeeping & Journalizing",
                "Preparation of Ledger, Trial Balance, Profit & Loss Account, Balance Sheet",
                "Cost Accounting Concepts & Break-Even Analysis"
            ],
            "textbooks": ["Management Principles by Koontz & O'Donnell", "Financial Accounting by T.S. Grewal"]
        }
    ],
    3: [
        {
            "code": "BCA301",
            "name": "Database Management Systems",
            "credits": 4,
            "ltp": "3-0-2",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Database Architecture: 3-Tier Schema, Data Independence, DBMS Components",
                "Entity-Relationship Modeling: Entities, Attributes, Relationships, Cardinality",
                "Relational Algebra: Selection, Projection, Joins, Division, Tuple Relational Calculus",
                "SQL: DDL, DML, DCL, Complex Queries, Subqueries, Views, Triggers, Indexes",
                "Normalization: 1NF, 2NF, 3NF, BCNF, Multi-Valued Dependencies",
                "Transactions & Concurrency: ACID Properties, 2-Phase Locking, Deadlock Resolution"
            ],
            "textbooks": ["Database System Concepts by Silberschatz, Korth, Sudarshan", "Fundamentals of Database Systems by Elmasri & Navathe"]
        },
        {
            "code": "BCA302",
            "name": "Data Structures using C++",
            "credits": 4,
            "ltp": "3-0-2",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Asymptotic Notations: Big-O, Omega, Theta, Space & Time Complexity Analysis",
                "Linear Data Structures: Arrays, Linked Lists (Singly, Doubly, Circular)",
                "Stacks & Queues: Applications in Expression Evaluation, Recursion, Circular Queues, Deques",
                "Non-Linear Data Structures: Binary Trees, BST Operations, AVL Trees, Heaps",
                "Graphs: Adjacency Matrix/List, BFS, DFS, Dijkstra, Prim's, Kruskal's",
                "Sorting & Searching: QuickSort, MergeSort, RadixSort, Binary Search"
            ],
            "textbooks": ["Data Structures and Algorithm Analysis in C++ by Mark Allen Weiss", "Data Structures using C and C++ by Tanenbaum"]
        },
        {
            "code": "BCA303",
            "name": "Computer Architecture and Organization",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Register Transfer Language, Micro-operations, Instruction Formats",
                "CPU Design: Control Unit Design (Hardwired vs Microprogrammed)",
                "Computer Arithmetic: Booth's Algorithm for Signed Multiplication, Restoring Division",
                "Memory Architecture: Cache Memory Mapping (Direct, Associative, Set-Associative), Virtual Memory",
                "Input-Output Organization: Programmed I/O, Interrupt-Driven I/O, Direct Memory Access (DMA)"
            ],
            "textbooks": ["Computer System Architecture by M. Morris Mano", "Computer Organization by Carl Hamacher"]
        },
        {
            "code": "BCA304",
            "name": "Discrete Mathematics & Graph Theory",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Formal Languages, Grammars & Chomsky Hierarchy",
                "Finite State Automata: DFA, NFA, Equivalence & Minimization",
                "Advanced Graph Theory: Planarity, Euler Formula, Graph Coloring, Chromatic Number",
                "Trees: Spanning Trees, Cayley's Theorem, Tree Traversals",
                "Algebraic Structures: Groups, Subgroups, Rings, Fields"
            ],
            "textbooks": ["Elements of Discrete Mathematics by C.L. Liu", "Introduction to Graph Theory by Douglas West"]
        },
        {
            "code": "BCA305",
            "name": "Web Technologies & Internet Programming",
            "credits": 4,
            "ltp": "3-0-2",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "HTML5 Semantic Tags, Canvas, SVG, Form Validations",
                "CSS3 Layouts: Flexbox, CSS Grid, Media Queries, Responsive Design",
                "JavaScript Core: ES6+ Syntax, Promises, Async/Await, DOM Manipulation, Fetch API",
                "Node.js Basics: Modules, HTTP Server, Express Framework Routing",
                "RESTful API Integration, JSON Schema Validation & Client-Side State"
            ],
            "textbooks": ["Web Design with HTML, CSS, JavaScript by Jon Duckett", "Learning Web Design by Jennifer Robbins"]
        },
        {
            "code": "BCA306",
            "name": "Software Engineering Methodologies",
            "credits": 3,
            "ltp": "3-0-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Software Lifecycle Models: Waterfall, Spiral, Agile Scrum, Kanban",
                "Requirement Engineering: SRS Documentation, Use Case Modeling, User Stories",
                "Software Architectural Patterns: Layered, MVC, Microservices",
                "Testing Strategies: Black-box, White-box, Unit, Integration, Regression Testing",
                "Software Maintenance, Quality Assurance (CMMI, ISO 9001), Git Version Control"
            ],
            "textbooks": ["Software Engineering: A Practitioner's Approach by Roger S. Pressman", "Software Engineering by Ian Sommerville"]
        }
    ],
    4: [
        {
            "code": "BCA401",
            "name": "Design & Analysis of Algorithms",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Algorithm Analysis: Recurrences, Master Theorem, Substitution Method",
                "Divide and Conquer: Strassen's Matrix Multiplication, Convex Hull",
                "Greedy Paradigm: Fractional Knapsack, Huffman Coding, Job Sequencing with Deadlines",
                "Dynamic Programming: 0/1 Knapsack, Longest Common Subsequence, Matrix Chain Multiplication",
                "Backtracking & Branch-and-Bound: N-Queens, Graph Coloring, Travelling Salesperson",
                "NP-Completeness: Classes P, NP, NP-Hard, NP-Complete, Cook's Theorem"
            ],
            "textbooks": ["Introduction to Algorithms by Cormen, Leiserson, Rivest, Stein (CLRS)"]
        },
        {
            "code": "BCA402",
            "name": "Java Programming & Enterprise Applications",
            "credits": 4,
            "ltp": "3-0-2",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Java Virtual Machine (JVM) Architecture, Bytecode, Garbage Collection",
                "Collections Framework: ArrayList, LinkedList, HashMap, TreeSet, Iterators",
                "Multithreading & Concurrency: Thread Lifecycle, Synchronization, Inter-thread Communication",
                "Java Database Connectivity (JDBC): Connection Pooling, Prepared Statements, Transactions",
                "Spring Boot Basics: Dependency Injection, REST Controllers, JPA Repositories"
            ],
            "textbooks": ["Java: The Complete Reference by Herbert Schildt", "Core Java Volume I & II by Cay Horstmann"]
        },
        {
            "code": "BCA403",
            "name": "Operating Systems Principles",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Process Management: PCB, Process States, Context Switching",
                "CPU Scheduling Algorithms: FCFS, SJF, Round Robin, Multilevel Feedback Queue",
                "Process Synchronization: Critical Section Problem, Semaphores, Monitors, Classic Problems",
                "Deadlocks: Detection, Prevention, Avoidance (Banker's Algorithm)",
                "Memory Management: Paging, Segmentation, Virtual Memory, Page Replacement (FIFO, LRU, Optimal)",
                "File Systems & Disk Scheduling: FCFS, SSTF, SCAN, C-SCAN"
            ],
            "textbooks": ["Operating System Concepts by Silberschatz, Galvin, Gagne", "Modern Operating Systems by Andrew Tanenbaum"]
        },
        {
            "code": "BCA404",
            "name": "Computer Networks & Data Communication",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "OSI 7-Layer Model & TCP/IP Protocol Architecture",
                "Physical Layer: Transmission Media, Modulation, Multiplexing (FDM, TDM, WDM)",
                "Data Link Layer: Framing, Error Detection (CRC, Checksum), Flow Control (Sliding Window)",
                "Network Layer: IPv4/IPv6 Addressing, Subnetting, CIDR, Routing Protocols (RIP, OSPF, BGP)",
                "Transport Layer: TCP vs UDP, Three-Way Handshake, Congestion Control",
                "Application Layer: DNS, HTTP/HTTPS, SMTP, FTP, DHCP"
            ],
            "textbooks": ["Computer Networking: A Top-Down Approach by Kurose & Ross", "Data Communications and Networking by Behrouz Forouzan"]
        }
    ],
    5: [
        {
            "code": "BCA501",
            "name": "Artificial Intelligence & Machine Learning",
            "credits": 4,
            "ltp": "3-0-2",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "AI Foundations: Intelligent Agents, State-Space Representation",
                "Search Strategies: Uninformed (BFS, DFS) & Informed (A*, Greedy Best-First, Minimax)",
                "Knowledge Representation: First-Order Logic, Semantic Networks, Bayesian Networks",
                "Supervised Learning: Linear Regression, Logistic Regression, Decision Trees, Random Forests",
                "Unsupervised Learning: K-Means Clustering, PCA Dimensionality Reduction",
                "Neural Networks: Perceptron, Multi-Layer Perceptron, Backpropagation"
            ],
            "textbooks": ["Artificial Intelligence: A Modern Approach by Russell & Norvig", "Machine Learning by Tom Mitchell"]
        },
        {
            "code": "BCA502",
            "name": "Cloud Computing & DevOps",
            "credits": 4,
            "ltp": "3-0-2",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Cloud Service Models: IaaS, PaaS, SaaS, FaaS",
                "Virtualization Hypervisors (Type 1 & Type 2), Containerization with Docker",
                "Container Orchestration with Kubernetes: Pods, Services, Deployments",
                "CI/CD Pipelines: GitHub Actions, Automated Testing, Continuous Deployment",
                "Cloud Storage & Security: Object Storage (S3), IAM Policies, Encryption"
            ],
            "textbooks": ["Cloud Computing: Concepts, Technology & Architecture by Thomas Erl"]
        },
        {
            "code": "BCA503",
            "name": "Information Security & Cryptography",
            "credits": 4,
            "ltp": "3-1-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Security Principles: Confidentiality, Integrity, Availability (CIA Triad)",
                "Symmetric Cryptography: DES, 3DES, AES, Block Cipher Modes (CBC, GCM)",
                "Asymmetric Cryptography: RSA, Diffie-Hellman Key Exchange, Elliptic Curve Cryptography",
                "Cryptographic Hash Functions: SHA-256, HMAC, Digital Signatures, Public Key Infrastructure (PKI)",
                "Network Security Attacks: SQL Injection, XSS, Man-in-the-Middle, DDoS Mitigations"
            ],
            "textbooks": ["Cryptography and Network Security by William Stallings"]
        }
    ],
    6: [
        {
            "code": "BCA601",
            "name": "Major Capstone Project & Viva Voce",
            "credits": 8,
            "ltp": "0-0-16",
            "internal_max": 100,
            "external_max": 200,
            "passing_marks": 80,
            "syllabus_modules": [
                "Problem Definition, Feasibility Study, Market Analysis",
                "System Architecture Design, UML Diagrams, Database Schema Normalization",
                "Full-Stack Implementation & Unit/Integration Testing",
                "Deployment on Cloud Infrastructure with CI/CD Automation",
                "Thesis Documentation, Code Review, Final Viva Voce Defense"
            ],
            "textbooks": ["Software Engineering Project Handbook by University Academic Council"]
        },
        {
            "code": "BCA602",
            "name": "Cyber Laws and Intellectual Property Rights",
            "credits": 3,
            "ltp": "3-0-0",
            "internal_max": 50,
            "external_max": 100,
            "passing_marks": 40,
            "syllabus_modules": [
                "Information Technology Act 2000 & Amendments",
                "Cyber Crimes: Hacking, Identity Theft, Phishing, Data Privacy Breaches",
                "Digital Signature Certifying Authorities, Electronic Evidences",
                "Patents, Trademarks, Copyrights in Software Industry, Open Source Licenses (MIT, GPL, Apache)"
            ],
            "textbooks": ["Cyber Law in India by Farooq Ahmad"]
        }
    ]
}


def get_curriculum_for_semester(semester: int) -> List[Dict[str, Any]]:
    """Fetches full course syllabus details for a designated semester."""
    return BCA_CURRICULUM.get(semester, [])


def get_subject_by_code(subject_code: str) -> Dict[str, Any]:
    """Finds detailed syllabus entry for any given subject code."""
    for sem_num, subjects in BCA_CURRICULUM.items():
        for sub in subjects:
            if sub["code"].upper() == subject_code.strip().upper():
                return sub
    return {}


def get_total_program_credits() -> int:
    """Calculates total credits required for program completion."""
    total = 0
    for sem_num, subjects in BCA_CURRICULUM.items():
        for sub in subjects:
            total += sub["credits"]
    return total
