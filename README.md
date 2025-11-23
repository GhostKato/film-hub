# Individual project: film hub

### Description:

Film Hub is a website for searching and exploring movies and TV series. The platform provides a convenient interface to find, track, and manage media content, as well as personalized lists for registered users.

![Homepage](/public/readme/home-page.png)

---

### Features:

1. **Homepage:**
   - Slider of popular movies of the day with clickable cards to open details.
   - Search field for movies and TV series; redirects to the search page when used.
   - Homepage opens on site start or when clicking the logo.

![Slider](/public/readme/slider.png)

2. **Search page:**
   - Allows filtering by type (movie or TV series), genre, rating, and release year.
   - Search field available for quick navigation.
   - Accessed via the search icon.

![Search](/public/readme/search-page.png)

3. **Movies page:**
   - Lists of popular movies, top-rated, currently in theaters, and upcoming.
   - Search field included.
   - Navigation button to the movies page.

![Movies](/public/readme/movies-page.png)

4. **Series page:**
   - Lists of popular series, top-rated, currently airing, and airing today.
   - Search field included.
   - Navigation button to the series page.

![Series](/public/readme/series-page.png)

5. **Collections page:**
   - Recommended movies and series curated by Film Hub.
   - User’s favorite list.
   - Watch later list managed by the user.
   - Filtering by name, type, genre, rating, and release year.
   - Navigation button to collections.

![Collections](/public/readme/collection-page.png)

6. **Media page:**
   - Detailed information about a movie or TV series: rating, release date, description.
   - Watch trailers directly on the page.
   - Buttons to add/remove to user lists (favorites, watch later) and share.
   - Lists of cast and crew.

![Media](/public/readme/media-page.png)

7. **Person page:**
   - Biography and list of projects the person participated in.

![Person](/public/readme/person-page.png)

8. **Site menu:**
   - User authentication: login/logout, registration.
   - Language switching.
   - Saved data for non-authenticated users is stored locally.
   - Authenticated users sync data with the cloud.
   - Language change updates both UI and API data, including trailer audio.

![Menu](/public/readme/menu.png)

---

### Color coding:

- **Release date:**
  - Purple — upcoming
  - Blue — released today
  - Green — released yesterday or earlier
- **Rating:**
  - Green — 8–10
  - Orange — 5–7
  - Red — 0–4

![Color-coding](/public/readme/rating-release-colors.png)

---

### Stages of implementation:

1. **Interface design:**
   - Develop layouts for homepage, search, movies, series, collections, media, and person pages.
   - Choose color scheme and typography.
   - Create intuitive navigation and menu.

2. **Functionality development:**
   - Integrate TMDB API for fetching movies and series.
   - Implement user authentication and lists using Firebase.
   - Local storage for unauthenticated users and sync for authenticated ones.
   - Search and filter features for movies, series, and collections.
   - Language switching for UI and API data.
   - Color coding for ratings and release dates.

![Search-filter](/public/readme/search-filter.png)

3. **Testing:**
   - Test all pages and features across devices.
   - Ensure smooth API integration and user list synchronization.

4. **Launch and support:**
   - Publish the site.
   - Monitor and update features based on user feedback.

---

### Advantages of using:

- Quick access to movies and TV series information.
- Personalized lists for favorites, watch later, and recommended content.
- Filtering by type, genre, rating, and release year.
- Sync of local data with the cloud for authenticated users.
- Language switching for UI and API data, including trailer audio.
- Color coding for easy visual perception of ratings and release dates.
- Detailed information about media and people involved.
- Responsive and adaptive design for different devices.

![Media-details](/public/readme/media-details.jpg)

---

### Technologies used:

1. **Programming languages:**
   - **JavaScript**
   - **TypeScript**

2. **Frameworks and Libraries:**
   - **Vue.js**
   - **Pinia**
   - **SASS**

3. **Databases & Storage:**
   - **Firebase** (Authentication, Firestore for lists)

4. **API Integration:**
   - **TMDB API** for movies and TV series data

5. **Safety:**
   - **HTTPS**
   - **Firebase authentication**

6. **Other technologies:**
   - **Git**
   - **LocalStorage** for unauthenticated users

7. **Adaptability:**
   - **CSS Media Queries**
   - **Flexbox**
   - **Grid**

---

Film Hub provides a convenient and interactive platform for discovering movies and TV series. It offers detailed media information, personalized lists, search and filtering capabilities, and user-friendly navigation. Data synchronization and adaptive design ensure a smooth experience on all devices.
