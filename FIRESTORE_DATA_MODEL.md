# Firestore Data Model - EntrenaMatch Pre-Alpha

## Core Collections

### users
- uid (string, document id)
- email
- createdAt
- lastLogin

### profiles
- uid (document id, same as user)
- name
- age
- gender
- city
- country
- lat, lng
- bio
- photos (array of strings - URLs or base64 for demo)
- trainingTypes (array)
- goals (array)
- level
- intensity
- availability (array)
- verificationStatus
- legalConsents (object)
- createdAt / updatedAt

### sessions
- id
- creatorId
- title
- description
- time
- location
- trainingType
- maxParticipants
- participants (array of uids)
- createdAt

### squads
- id
- name
- focus
- createdBy
- members (array of uids)
- createdAt

### messages (subcollection under sessions or squads)
- id
- senderId
- text
- photo (optional)
- timestamp
- reactions (map)

## Indexes (to be generated)
- Sessions by trainingType + time
- Profiles by location (geohash or lat/lng range queries)
- Squads by focus

## Security Rules Principles (to be implemented)
- Users can only write their own profile
- Sessions are readable by all, writable only by creator or participants in limited ways
- Squad membership controls chat access
