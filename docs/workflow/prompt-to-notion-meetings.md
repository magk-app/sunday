===============================
MCP for Meetings
===============================
You are a virtual assistant that is in charge of tracking and intaking all meetings from multiple users into the Notion meetings database. You'll be given a list of meeting links and you may or may not have the text contents.  Regardless, I want you to scrape all the meeting contents, including the summary, the notes, and everything. And then I want you to record them in a Notion database for easy tracking. 

===============================
Meeting Heuristics:
===============================
Remember, there are properties that may or may not exist depending on the meeting itself. Always check and fetch from the Notion database to ensure that all properties are covered, and don't add new properties. Only utilize existing properties.

So every meeting will have a name. So you have to have a title. The title should include key people in a meeting, not everyone. If it's a large meeting, just key people or companies depending on the meeting. And also a brief like.  Notation on what type of meeting it is, whether it's a stand-up meeting, team development meeting, etc.

I want to add some examples of meetings that is important. For one-on-one meetings, use the format person1, ampersand, person2, colon, meeting information. So the first person is usually someone in the Epicor, sorry, not Epicor, in the magic team, and the second person is the guest. For any meetings that's Jack and Kevin specifically, just call them co-founder meetings. For any customer meetings, make sure to add a customer. For any meeting that has full team, include the main stakeholders. So Jack, Kevin, Karthik, etc. For external meetings, label them as external meetings. Like Cursor's founding journey speaker note is not really related to our meeting, but it's just external notes for us to reference.

Some meetings are meetings that are scheduled. Usually you want a status that tracks different things. I'll describe the status very soon.  Here's the statuses. The meetings will have scheduled, meaning it's officially scheduled and ready to meet. Completed, meaning the meeting is already done. And canceled, meaning the meeting was canceled for any reasons. Only use official existing properties that you can use. Don't use new properties that don't exist, okay?

Next is the meeting type. Currently, there are a few types of meetings that we want to consider. There's internal and external meetings. This is very important. Internal meetings are meetings that are only within a team. So these meetings include stand-ups, which is just checking in on progress. Full team sync, which is a full meeting that syncs up the entire team.  In the company on large updates. Development meetings, developer team only. Business meetings, business only. There are also external meetings. First type is meetings with clients, very important. Second type is advisor meetings. The final type is...  VC meetings with VCs, legal meetings for legal, hiring meetings for hiring people. Competition meetings for competitors.

The date of the meeting is very self-obvious. It's just the date of the meeting. And the meeting URL includes the URL where the meeting is transcribed. Almost all meetings are transcribed with Granola, but there's a possibility that it's transcribed with someone else. So don't worry about it too much. 

For the summary of the meeting, I want you to write a summary about what happened in the meeting that is easy to review and recall.

For the participants, I want to have a list of participants using multi-select tags. This will be very useful to track who we're leading. Since not all people are within the team, we'll just use multi-select tags for this.

For each meetings that you add into the database, usually there's a full detail of what happened in the meeting. I want you to record that within the Notion page itself so that you can reference it from the Notion page. This is important in the future because we want to build a knowledge base that takes all of these meetings from this place. This is a very important task.

===============================
Updating Meetings
===============================
Inevitably, you will have to update meetings. This is really important because sometimes we'll have to edit priorities and change things. Here are some heuristics that can help you edit the meetings. Number one, fetch the meetings and see their existing input so you can have an understanding of the properties that exist. There might be new properties that I've not written here, so keep that in mind. If there are new properties that exist and most meetings have them,  Perhaps that's important. Number two, after you have fetched the meetings, you can start updating the meetings using the write schema and write MCP calls. Think carefully and make sure that your prompts are accurate and validated before you do the prompts. Number three, if there's any errors that exist, ensure to check the error and try again at least three times before asking for help.  For human intervention.

===============================
MCP for Meetings
===============================
MAGK Meetings: UPDATE from cursor
HASH for MAGK Meetings: update from cursor after MCP c ommand

===============================
Team members:
===============================
# Jack Luo

Jack Luo is the technical co-founder of this company. He excels at systems thinking, architecture, engineering tasks, design, and product planning. He is an executive that can operate multiple tasks and delegate to people. Ensure that tasks given to Jack are high-level abstract vision and systems thinking.

# Kevin Zhang

Kevin Zhang is the business co-founder of the company. He excels at talking to people at the highest level, customer discovery, vision design, product planning, community building. He's also an executive that can operate multiple tasks to delegate to people. He is currently in an internship for the summer, but will work full-time afterwards. The tasks that should be given to Kevin should be focused on marketing, sales, community, business strategy, and finance.

# Karthik Jandhyala

Karthik is a software engineer intern at Magic. He is good at writing research, main research, embedded system, computer engineering, and also computer science. He can work on the software, some architecture stuff, but it's lower scope than the founders. has about part-time availability so assign more granular features

# Virtual Assistant
Currently, we are in the process of hiring a generalist virtual assistant that can help us do some work every day for a fee. This can save us some time so that we can focus on more important stuff. It's going to be about $32 per day, $600 in total.  And we want to ensure that we have this assistance so that we can work on other stuff. Yeah. So this is just a general list. So when you assign tasks, you can consider the virtual assistant for things that don't really need our input that much using the automation tag.

++++++++++++++++++++++++++++++++++++++++++++++++++++++
MIGRATE MEETINGS:
Move and migrate The following meetings from the old meetings database
MCP Connector Hash: d707b78677e7453cb489b8ba102b7e26

DATABSE ID
{
"id": "d707b786-77e7-453c-b489-b8ba102b7e26"
}

++++++++++++++++++++++++++++++++++++++++++++++++++++++
NEW MEETINGS:
Here are the following meetings that you should create:
# Meeting: Jack kevin architecture notion, product

Tue, 01 Jul 25

### Architectural Vision & Product Strategy

- Defined 3 key layers of abstraction for the product:
  - Layer 3: Agent Tools (base level tools like Cursor, Figma, etc.)
  - Layer 2: Managers (workflow creation/orchestration)
  - Layer 1: Head Agents/Department Heads
  - Layer 0: Chief of Staff (highest level orchestration)
- Current focus: Building managers that can create workflows
- Identified core product pillars:
  - Natural language/human-in-loop interaction
  - Akinator-style contextual questioning
  - Multi-agent capabilities
  - Deep personalization

### MVP Timeline & Development Constraints

- Current team: 1.5 engineers (1 full-time, Karthik part-time from India)
- Target MVP completion: Mid-August uncertain due to:
  - Limited engineering resources
  - Research uncertainty around Bayesian reasoning
  - No existing product references
- MVP Definition: AI that can:
  - Ask clarifying questions about user goals
  - Create basic working workflows
  - Execute simple automation tasks

### Near-Term Business Strategy

- Initial Focus: Consultancy model building custom workflows
- Revenue Generation Plan:
  - Free 30-minute consultation meetings
  - Upfront fee for workflow building
  - Deployment fee
  - Usage-based recurring charges
- Customer Acquisition Strategy:
  - Build website
  - Use Phantom Buster for outreach
  - Target 6:30-8:30 PM EST meeting slots
- Building reusable workflow modules while serving individual clients

### Company Culture Implementation

- Need dedicated meeting to discuss:
  - Culture evolution as team grows
  - Integration of new team members
  - Values and working principles
- Focus on collaborative, open communication
- Celebrate both failures and successes
- Maintain work-life balance with structured social time

### Technical Architecture Considerations

- Frontend development prioritized to date
- Backend architecture needs further discussion
- Research questions around:
  - Bayesian reasoning implementation
  - Question-asking optimization
  - Workflow modularization
- Integration strategy for multiple AI tools/services

### Marketing & Distribution Strategy

- Delay major marketing until product validation
- Consider creative marketing approaches specific to NYC
- Initial focus on research-based companies
- Target small teams and individuals leading teams
- Potential future creative marketing ideas:
  - Custom LEGO sets matching workflow concept
  - Broadway-style promotions
  - Holiday-themed campaigns

### Team Structure & Immediate Next Steps

- VA hiring considerations:
  - Two candidates identified ($4/hr and $8/hr)
  - Test project: Website creation and email outreach
- Tomorrow’s priorities:
  - Jack: Website development
  - Test Phantom Buster for initial outreach
- Timeline planning through August with clear sprint definitions

### Resource Management

- Funding considerations:
  - Bootstrap initially through consulting revenue
  - Delay fundraising until clear use case
  - AI startup space currently saturated
- Team expansion needs:
  - 3-4 good engineers ideal for full platform
  - Target 1-year timeline for full product
- Current resource allocation between technical and business development

---

Chat with meeting transcript: [https://notes.granola.ai/d/6e983579-379e-4e44-a825-0a625667f0fa](https://notes.granola.ai/d/6e983579-379e-4e44-a825-0a625667f0fa)


# jack alex

Tue, 01 Jul 25

### Business Strategy & Focus

- Current priority: Generate revenue through consultancy work while building reusable workflows
- Business model progression:
  - Start as consultancy with manual workflows
  - Build reusable workflow components
  - Transition toward SaaS product
- Impact focus: Balance between revenue generation and positive impact on productivity
  - Creating feedback loop: Impact → Revenue → Greater Impact

### Team Building Plans

- Target: 5 core team members needed for profitability
- Current hiring needs:
  - Additional engineer (high priority)
  - Sales/marketing person
  - Operations role (considering VA separately)
- Potential team member: Arman
  - Good cultural fit
  - Interested in second brain technology
  - Discussing potential arrangements (free workspace, meals)

### Daily Operations & Process

- Implementing daily standups between co-founders
  - 5-10 minute duration
  - Planning to record for tracking
  - Logistics: Using shared microphone/earbuds setup
- Key daily activities identified:
  - Coding/programming time
  - UI/UX testing
  - Customer interviews
  - Content creation (TikTok, Twitter)
  - Architecture and product design
  - Evening co-founder sync

### Funding Strategy

- Current approach: Not actively seeking VC funding
  - Philosophy: “When we need money, VCs don’t need us. When we don’t need money, they want us”
- Considering angel investment:
  - Potential meeting with Northwestern alum investor (next Tuesday)
  - Interest in Crispr Clause billionaire funding
- Future funding needs identified:
  - Co-founder survival costs (~$60k)
  - Cloud computing expenses
  - Team hiring costs

### Workspace & Tools

- WeWork access secured ($19 vs. regular $40)
- Equipment needs:
  - Keyboard (already acquired)
  - Mouse needed (planning Amazon/Best Buy purchase)
- Planning Figma implementation for UI/UX design

---

Chat with meeting transcript: [https://notes.granola.ai/d/11e35fbb-7c77-483e-9614-20b2b61677cf](https://notes.granola.ai/d/11e35fbb-7c77-483e-9614-20b2b61677cf)


# Jack <> Tinah (Andera)

Wed, 02 Jul 25

### Company Background & Product Overview

- Building an AI workflow automation platform that:
  - Creates workflows through natural language conversations
  - Abstracts away manual Zapier-like drag-and-drop configuration
  - Focuses on making automation accessible to smaller teams
  - Currently in development for several months
- Key differentiators:
  - Context-aware AI that asks clarifying questions
  - Planned marketplace for workflow sharing and composition
  - Potential monetization for workflow creators
  - Human-in-loop approach with milestone check-ins

### Current Status & Technical Challenges

- Development stage:
  - Testing simple workflows (2-3 steps)
  - Currently API-only, no browser automation yet
  - Focusing on reliability and context understanding
  - Building and selling simultaneously
- Current customer segments:
  - Startups seeking efficiency
  - Finance firms (data migration)
  - Sales teams (lead generation)
  - Marketing teams (outbound)
- Main technical challenge: Getting AI to ask appropriate contextual questions
  - Example: Word “agent” means different things in different industries
  - Exploring research papers for solutions
  - Currently mitigating through increased user confirmation

### Market & Competition

- Competitors:
  - Zapier: Large but clunky AI implementation
  - M8N (German company): Similar limitations to Zapier
  - Gun Loop: Private company, market position unclear
- Market approach:
  - Currently maintaining general platform approach
  - Considering potential vertical focus
  - Excel/document workflows showing promise but facing competition (e.g., Quadratic IO)
- Hiring status:
  - Actively looking but being selective
  - Focusing on mission-driven candidates
  - Using mix of network referrals and LinkedIn outreach

---

Chat with meeting transcript: [https://notes.granola.ai/d/3111daa3-ac0c-4dac-8281-3d7d45bc06c1](https://notes.granola.ai/d/3111daa3-ac0c-4dac-8281-3d7d45bc06c1)

# jack x Sam

Wed, 02 Jul 25

### Backgrounds & Current Work

- Sam’s Background:
  - Stanford PhD student (planning to leave for startups)
  - Works at Bling Capital & TC Adventure Fund as venture associate
  - Former BCG consultant focusing on data analytics & PE
  - Harvard undergrad & masters in Physics
  - Originally from New Jersey, now in Bay Area for 4 years
- Jack’s Background:
  - 4th year CS student at Georgia Tech (AI & embedded systems focus)
  - Previously worked on AI safety & model alignment
  - Currently working on:
    - MCP app store for decentralized agent deployment
    - Startup building natural language workflow automation for non-technical users
  - Past experience with energy monitoring/optimization for residential solar & battery systems

### Key Discussion Areas

- Workflow Automation Space:
  - Current challenges: High barrier to entry, clunky interfaces, reliability issues
  - Opportunity: Better LLM-powered question-asking to understand user needs
  - Monetization strategy: 25% platform fee + allowing creators to add 10-15% markup
  - Competition from [Fetch.ai](http://Fetch.ai) and others in agent marketplace space
- Shared Interests:
  - Aviation (Jack: flight simulation, Sam: aviation industry experience)
  - AI/Tech intersection with business
  - Consumer AI products and productivity tools
  - Gamification in productivity tracking

### Next Steps

- Jack visiting SF July 12-16th
- Sam offered to:
  - Meet for coffee/lunch during Jack’s SF visit
  - Introduce Jack to Bling Capital for potential pre-seed/seed discussions
- Agreed to stay in touch regarding startup developments

---

Chat with meeting transcript: [https://notes.granola.ai/d/b2698097-f06f-4efb-b995-ac68f63e61c5](https://notes.granola.ai/d/b2698097-f06f-4efb-b995-ac68f63e61c5)

# Jack x Kevin meeting July 2nd, 2025.

Wed, 02 Jul 25

### Meeting Updates

- Tinah’s Meeting:
  - Company focuses on compliance automation
  - Takes 6+ months to close first deals due to security compliance
  - Interested in browser-based automation solution (for platforms without APIs)
  - Potential customer for MAGK if we can build browser automation
  - Key insight: Choose boring markets with high pain points
- Sam’s Meeting:
  - Background: Harvard physics grad, BCG consulting, Dink Capital, now Stanford PhD
  - Introduced two platforms: [Fetch.AI](http://Fetch.AI) and Solvable
  - Has VC connections through Blink Capital ($19B portfolio)
  - Potential for warm intro when needed
  - Planning to meet in SF (July 12-16)

### Competitor Analysis

- [Fetch.AI](http://Fetch.AI) ($250M valuation):
  - Offers agent marketplace with 2.5M+ agents
  - No-code agent studio
  - Decentralized token system
  - Core components: Marketplace, No-code builder, Wallet
- Other competitors:
  - [Make.com](http://Make.com) (formerly Integromat)
  - n8n
  - Solvable
  - Zapier (valued at $5B)

### Product Strategy & Positioning

- Name discussion:
  - Secured magic.app domain
  - Avoiding overused terms like “AI”, “agent”, “workflow”
  - Exploring terms: “operational partner”, “autonomous intern”, “chief of staff”
- Market differentiation:
  - Focus on being general platform first
  - Build specific workflows for consultancy
  - Combine manual and automated approaches initially

### Infrastructure Setup

- Created Slack workspace
- Established magic.app email domain
- Planning GitHub organization setup
- Need to kickoff MAGK repository

### Content & Marketing Strategy

Three-tier content approach:

- Professional Content:
  - Workflow building tutorials
  - Product comparisons
  - LinkedIn/website blogs
- Viral Content:
  - TikTok demonstrations
  - Automation success stories
  - “Day in the life” content
- Casual Content:
  - Tweets
  - Instagram posts
  - Work-life balance content

### Virtual Assistant Planning

- Found potential VA ($8/hour, 4 hours/day):
  - Can handle market research
  - Customer intake management
  - Competitor analysis
  - Social media management
  - Email management
  - Meeting coordination

### Project Structure

Current active projects:

- Sunday Development (Email Assistant)
  - Started: June 24th
  - End: July 6th
  - Goal: Understanding workflow building
- Market Testing
  - June 30th - July 20th
  - Focus: Customer discovery and niche identification
- Magic Development
  - Started: July 1st
  - Target: August 15th
  - Focus: Platform architecture and engineering
- Hiring
  - Start: August 15th
  - Priorities: Technical, Sales, Marketing, Design roles

### Next Steps

- Transfer tasks from Cursor to Notion
- Setup project management infrastructure
- Begin VA onboarding process
- Start Reddit-based customer discovery
- Continue architecture design discussions
- Implement basic workflow automation

---

Chat with meeting transcript: [https://notes.granola.ai/d/9ae2bb48-8994-48c6-966d-6f33dee1cf2c](https://notes.granola.ai/d/9ae2bb48-8994-48c6-966d-6f33dee1cf2c)







