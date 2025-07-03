===============================
MCP Workflow Prompts:
===============================
You're senior project manager that is in charge of assigning tasks to people, setting priorities, due dates, and all of that for tasks specifically. Task prompts comes from within the prompt itself as a series of tasks in plain text, either through voice chat or through text prompts. Your goal is to process and organize these tasks into the database so that all the tasks are properly assigned.  Use deep reasoning and thinking to make sure that tasks are accurate and use validation to make sure that all the tasks assigned make sense. This is for the Notion MCP tool. Use Notion MCP to fetch project database first to understand the projects, then look at the tasks and assign the tasks and all the other properties from fetching the database. And finally, put all the tasks in create database.


===============================
Task Heuristics:
===============================
Remember, this is very important. You don't want to add new properties that will screw up the database. Only stick to existing property that exists in the database. And if necessary, use a description to add any notes that is not fitted, fitable on the property list.

When you assign projects, fetch from magic project database, ensuring that you actually have the right projects and look into each project summary to understand what is going on and assign tasks as such. If we cannot assign tasks to a specific project, put all tasks in miscellaneous and we will review them manually.

For task heuristics, let's start with status, which is usually "Not Started." For assignees, reference the teammates list. There are three people you can assign tasks to: Jack Luo, Kevin Zhang, and Karthik Jandhyala (J-A-N-D-H-Y-A-L-A).

Regarding priority, reference the MAGK projects to see what's currently being worked on as a baseline. Tasks that directly impact our metrics—such as acquiring paying users—should be "Very High" priority. Critical bug fixes are also "Very High" priority. Anything with a deadline is "Urgent" if it directly impacts our financial structure, product, or users. Everything else is lower priority unless specifically designated otherwise. Use your judgment when prioritizing tasks.

For categories and tags, since the system isn't fully set up yet, use whatever tag seems appropriate. You can use "Miscellaneous" if nothing else fits.

For due dates, not all tasks have due dates, and we'll assign most due dates, so don't put anything on due dates. But if there is an explicit due date mentioned in the task, please put a due date in.

For story point estimates, here is a rough guide:
One story point is tasks that are easy to do by almost anyone and it should be assigned to anyone intern level on the lowest level. Should be relatively simple. Two points are tasks that is not trivial. It requires some thinking, but it's nothing too complex. Three points is a standard software engineering feature though.  There's nothing too complex or require collaboration. It could be done by a single person, but it is the main bulk of work. Five points is a difficult feature that requires multiple people and requires high level of thinking, but it's not research level. Eight points is the hardest problem that required the whole company to intervene. It takes a long time.

When you're creating tasks, make sure you are assigning the task to the right projects. So retrieve the projects and then try to assign a project to the task. Because right now the project is, because it's important to categorize the task by projects. Also, make sure you're assigning to projects that is planning or in progress. Don't assign to projects that's in the backlog. This is really important, but their existing projects do not create new projects. You must assign the tasks to an existing project, no exceptions. If there is no projects you can assign to, you must assign them to miscellaneous.

There's an automation tag that you can use to track projects. There's a few tags currently. There could be more tags after this writing, but know that virtual assistants are tasks that should be able to be done with virtual assistants without too much company data being leaked.  Human required means it has to be done by the core team, and AI automation means it's a workflow that could be automated in the future. Consider these when you write the tags.

There is going to be a sprints tab now, so you don't want to assign them to sprints because we'll manually assign these tabs to sprints based on what makes the most sense. 

Each task should have an icon that represents the task. Not in the title itself, but there should be a separate icon property that you can update with an emoji. It's I believe called the icon property. PAGE ICON property is important for a quick glance at the task.

The required budget property is a property that is checked when the task requires any amount of money to truly do it, no matter how small it is. It's just a way to keep track of things. It's not as important, but something to keep track of.

When you're writing a description for the tasks, ensure that you have used the notes property to actually write a more detailed description of what you have to do. I like the titles, but then sometimes it's a bit confusing and vague. So you want to have a note so that there's a bit better description for each task.

Some tasks are tasks that have parent tasks and subtasks. An example is when you hire a virtual assistant, the hiring pipeline requires screening for people, scheduling interviews, and example projects. You want to ensure that the subtasks are properly categorized in a parent task for tasks that are subordinate to a bigger task workflow. Okay?  You want to have good hierarchy with organizing tasks.

===============================
Updating Tasks:
===============================
Inevitably, you will have to update tasks. This is really important because sometimes we'll have to edit priorities and change things. Here are some heuristics that can help you edit the tasks. Number one, fetch the tasks and see their existing input so you can have an understanding of the properties that exist. There might be new properties that I've not written here, so keep that in mind. If there are new properties that exist and most tasks have them,  Perhaps that's important. Number two, after you have fetched the tasks, you can start updating the tasks using the write schema and write MCP calls. Think carefully and make sure that your prompts are accurate and validated before you do the prompts. Number three, if there's any errors that exist, ensure to check the error and try again at least three times before asking for help.  For human intervention.

===============================
MCP for Project, Tasks and Bugs
===============================
MAGK Tasks: [https://www.notion.so/thejackluo/21c8a2eef32081c8b0e6cbd429b5842a?v=21c8a2eef3208162a1e9000c809b2058&source=copy_link](https://www.notion.so/21c8a2eef32081c8b0e6cbd429b5842a?pvs=21)
HASH for MAGK Task: 21c8a2eef32081c8b0e6cbd429b5842a
MAGK Projects: [https://www.notion.so/thejackluo/21c8a2eef320812192cddbe24589f14f?v=21c8a2eef3208153b5e7000c8a10c5b1&source=copy_link](https://www.notion.so/21c8a2eef320812192cddbe24589f14f?pvs=21)

HASH for MAGK Project: 21c8a2eef320812192cddbe24589f14f
MAGK Bugs: [https://www.notion.so/thejackluo/2238a2eef32080609035f148d87f7456?v=2238a2eef32080979aac000cdfbf41bb&source=copy_link](https://www.notion.so/2238a2eef32080609035f148d87f7456?pvs=21)
HASH for MAGK Bugs: 2238a2eef32080609035f148d87f7456

Users:
Jack Luo: 2704eb9185c14ca8ae9cf5fac908b42a
Kevin Zhang: af73dcd2b0ad4b088357887c49a8a3b0
Karthik Jandhyala: 2395b85415ae4dafa3b91fb631169d42


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

# AI
Some tasks are like writing, generation, and basic IOM stuff could be done fully with AI or almost automatable by AI. I'll define AI automation tag as any task that could be automated by AI for more than 50% of the work. So that includes writing forms, grant forms, sending emails, some internal messages, etc.  Core development work should still be assigned to humans and engineers and business strategy. So yeah, only like the basic tasks.

++++++++++++++++++++++++++++++++++++++++++++++++++++++
TODO TASKS:
===============================
operation Tasks
===============================
- Create a new client CRM that tracks the name of the client, company, role, automation need, and platform example, LinkedIn name, and email to track CRMs, and also another status that tracks the different steps of pipeline. So step one is lead discovery, initial meeting, workflow automating, workflow automated, and other things that's important. And finally, set up like an approximate deal side per month to track the number of money.
- Create a application CRM application and grants for grant applications, startup accelerator application, and other applications used to track funding, angel investments, and other things. That is very important. Ensure that it has the following content. Name, type of application, stage, due date, apply link, notes.

===============================
MISC Tasks
===============================
- Find 20 grant applications to apply to through sourcing from spreadsheets.
- WORKFLOW: Apply to the 20 applications automatically using a workflow generation, knowledge base, and everything else.

===============================
Development Tasks
===============================





+++++++++++++++++++++++++++++++++++++++++++++++++++++
COMPLETED TASKS:
===============================
Operation Tasks
===============================
- Decision making: Time tracking software, most likely Toggle, T-O-T-G-O, and also communities, which is most likely Discord, Slack, Discord for community building, Slack for professional communication, LinkedIn for professional announcements and everything. And finally, yeah, tiktok or instagram for marketting to the younger generation.
- Set up time tracking for Karthik and Kevin to track the task done as a team or find a solution for team tracking.
- Set up Notion project initial tasks for the core projects using both human input and Notion MCP to set things up. This will incorporate a starting point for development and also have a project management system that we can use to organize things. Ideally, this should be done in a few days from the dates we know of today.
- Internal Workflow: Fix the Notion meetings initial system so that we can have more time to work on execution rather than putting meetings into the Notion.
- Set up GitHub organization and set up the main magic repository. This acts as a starting point for development and should be put in the development for magic, M, H, and K.
- Set up a shared MIRO board for the team to work on architecture. This architecture will be the main basis for Magic, and it will include both backend and frontend architecture.
- Set up the Slack so that we can have team communications, co-founder communications, and communication with customers. This should include tickets for people and young.
- Important, hiring pipeline for a virtual assistant. First step, onlinejobs.ph. Set up a job post and write out the content to hire the right people. Number two, after applications are sent in, choose three to interview and do test projects. Number three, hire the person and set her up on everything.


===============================
Operation
===============================
- Set up Cursor API credits for using Sonnet 4, using API usage to maximize productivity on Cursor MCP for the team, for both me and Kevin.

===============================
Market Research Tasks
===============================
- Choose a workflow that makes sense for consultancy: Brainstorming and deciding on workflows based on our personal experiences, based on our conversations with people, and based on what makes sense to be very painful. This is a difficult task with multiple subtasks that should be created, which are included below, including building demo website presentations and marketing this to what people, and ultimately setting up a form that can get intake, and also setting up a way to crowdfund this as well.
- Building some form of demo, website, or presentation to showcase what the workflow can do for particular industries.
- Marketing and getting this demo slash website slash presentation out to 10,000 people in total to see who would ultimately use this platform.
- Set up a way to crowdfund for workflows so that we can have some initial funding to work on this, like for developers.
- Set up a form that can actually intake what are good workflows.

===============================
MISC Tasks
===============================
- Make a competitor list from Zapier, Make.com, and 8n, Solvable, and Fetch.AI, usedash, den. And discuss what makes us different from them. Modes we can consider based on a few factors. Number one, multi-agent orchestration. Number two, personalized agent that can understand user needs. And number three, Akinator AI that can ask great, great questions and ensure that the workflow is accurate for multiple workflows. And finally, discuss how we can break into the market and get in. Thank you
- Email the founder of zapier: Get an inside view on how they built Zapier, their company culture, scaling up from a startup to Series B. And finally, just have a cold talk about what they think the next trends are.

===============================
MAGK Development Tasks
===============================
- Upload the architecture diagram from the New York B works from July 2nd up to the mirror board for reference for designing the actual architecture. Magic, M-A-G-K.
- Create a more robust bug tracking platform on GitHub. Originate all bug issues through Notion and then write detailed GitHub MCP workflow that can convert bugs into GitHub issues.
- Super task. This is a multi-step process, but this is for writing and creating the architecture for the mirror board for Magic, now that we have a better understanding of everything. This would include drawing out the architecture, sending this to review for the team, and looking at feasibility for MVP as well.  This is a pretty important and somewhat urgent task.


===============================
Operation Tasks
===============================
- For the tasks, set up due dates and assignments and discuss how we can see tasks every day. And also set up views for easy organization of your own tasks. And finally, set up sprints as well that correspond to what the sprint actually is based on the roadmap we've defined.
- Create new tasks that could correspond to future sprints as well, including Sunday, magic development, etc.

===============================
Sunday project time
===============================
- Reorganize all the tasks in the plan.md to organize what is important and then create a new task workflow for development tasks specifically.
- Fix the issue with the bugs in which you're storing tasks at the old bug page and not storing it at the new bug page.


+++++++++++++++++++++++++++++++++++++++++++++++++++++
Future Tasks
===============================
Consultancy Workflow
===============================
[]: build out first workflow (manual)
- Customer intake to figure out what workflow we need to build. Ensure that the customer is giving us test files for the workflows. And also there's meetings and stuff. That's important.
- Miro or lucid chart diagram that showcases how the workflow is built.
- Build out the workflow manually using backend API and test files. Set this up in the workflow consultancy project and build this out using partially code and partially, yeah.
- Test out the workflow for production to check for errors and any inconsistencies.
- Deliver the workflow to the user and get feedback.

[]: convert manual workflow to automated workflow
- Mapping out the workflow into magic platform using prompts and manual editing when necessary. This is a way to convert, this is a very important task, and you do this by taking the code and putting this in the magic platform.
- Do A-B testing between manual and automated workflows. This is important to validate whether the magic platform is effective or not.

[]: build out second workflow (automated) (blocked by Magk platform.)
- Customer intake to figure out what workflow we need to build. Ensure that the customer is giving us test files for the workflows.
- Prompt the Magic platform to build the workflow and test everything on-site. This is a very important and large task as well that needs to be broken down as well.

===============================
Updating Meetings
===============================


