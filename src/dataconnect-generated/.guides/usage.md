# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, createJournalEntry, getMyJournalEntries, logActivity } from '@dataconnect/generated';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation CreateJournalEntry:  For variables, look at type CreateJournalEntryVars in ../index.d.ts
const { data } = await CreateJournalEntry(dataConnect, createJournalEntryVars);

// Operation GetMyJournalEntries: 
const { data } = await GetMyJournalEntries(dataConnect);

// Operation LogActivity:  For variables, look at type LogActivityVars in ../index.d.ts
const { data } = await LogActivity(dataConnect, logActivityVars);


```