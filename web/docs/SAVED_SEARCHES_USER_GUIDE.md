# Saved Searches - User Guide

## What are Saved Searches?

Saved Searches allow you to save your favorite filter combinations so you can quickly find projects without having to re-apply filters every time.

## How to Use Saved Searches

### Saving Your First Search

1. **Go to the Explore Page**
   - Navigate to http://localhost:3000/explore
   - You'll see the project discovery interface

2. **Apply Filters**
   - Click the "Filters" button to expand the filter panel
   - Select your desired filters:
     - **Search Term**: Enter keywords to search for
     - **Program**: Filter by academic program (e.g., Computer Science)
     - **Department**: Filter by department
     - **Academic Year**: Select a specific year (e.g., 2024-2025)
     - **Semester**: Choose Fall, Spring, or Summer
     - **Sort By**: Sort results by date, title, or rating

3. **Save the Search**
   - Click the "Saved" button (bookmark icon) in the filter panel
   - Click "Save Current Search" at the bottom of the dialog
   - Enter a descriptive name (e.g., "CS 2024 Fall Projects")
   - Click "Save"

### Loading a Saved Search

1. Click the "Saved" button in the filter panel
2. You'll see a list of all your saved searches
3. Click on any saved search to apply its filters instantly
4. The search will execute automatically and show matching projects

### Managing Your Saved Searches

#### Setting a Default Search

Your default search will be highlighted and appear at the top of the list.

**To set a default search:**
1. Click the "Saved" button
2. Find the search you want to make default
3. Click the empty star icon (☆) next to it
4. The star will become filled (★) and a "Default" badge will appear

**Note**: Only one search can be default at a time. Setting a new default will automatically unset the previous one.

#### Editing a Saved Search

**To edit a search name or filters:**
1. Click the "Saved" button
2. Click the pencil icon (✏️) on the search you want to edit
3. Update the name in the dialog that appears
4. Click "Update"

**Note**: To change the filters, you can edit the search and manually update the filter values, or delete the old search and save a new one with updated filters.

#### Deleting a Saved Search

**To remove a saved search:**
1. Click the "Saved" button
2. Click the trash icon (🗑️) on the search you want to delete
3. The search will be removed immediately

**Warning**: This action cannot be undone!

### Understanding the Saved Searches List

Each saved search shows:

- **Name**: The name you gave the search
- **Filter Summary**: A quick overview of active filters
- **Usage Count**: How many times you've used this search (e.g., "Used 5 times")
- **Default Badge**: Shows if this is your default search
- **Action Icons**:
  - ⭐ Star: Set/unset as default
  - ✏️ Edit: Change the name
  - 🗑️ Delete: Remove the search

The list is automatically sorted by:
1. Default searches first
2. Most frequently used searches
3. Alphabetically by name

## Example Use Cases

### Use Case 1: Faculty Advisor
**Scenario**: You're a faculty advisor who needs to regularly check CS projects from the current academic year.

**Solution**:
1. Set filters: Program = "Computer Science", Academic Year = "2024-2025"
2. Save as: "CS Current Year"
3. Set as default
4. Every time you visit the Explore page, you can quickly load this search

### Use Case 2: Student Researcher
**Scenario**: You're researching projects related to "machine learning" from the past 3 years.

**Solution**:
Create separate saved searches:
- "ML 2024": Search = "machine learning", Year = "2024-2025"
- "ML 2023": Search = "machine learning", Year = "2023-2024"
- "ML 2022": Search = "machine learning", Year = "2022-2023"

Now you can quickly switch between years without retyping.

### Use Case 3: Department Coordinator
**Scenario**: You need to monitor multiple programs in your department.

**Solution**:
Create saved searches for each program:
- "Software Engineering Projects"
- "Computer Science Projects"
- "Information Technology Projects"

Quickly switch between programs with a single click.

### Use Case 4: Project Quality Review
**Scenario**: You're reviewing highly-rated completed projects.

**Solution**:
1. Set filters: Sort By = "Rating", Sort Order = "Highest First", Status = "Completed"
2. Save as: "Top Rated Completed"
3. Access this search whenever you need to review quality projects

## Tips & Best Practices

### Naming Your Searches
- **Be Descriptive**: Use clear names that explain the filters
  - Good: "CS 2024 Fall Projects"
  - Bad: "Search 1"
  
- **Include Key Filters**: Mention the most important filters in the name
  - Example: "High Rated Software Engineering"
  
- **Use Consistent Naming**: Develop a naming pattern for similar searches
  - Example: "ML 2024", "ML 2023", "ML 2022"

### Organizing Your Searches
- **Set Defaults Wisely**: Make your most frequently used search the default
- **Delete Unused Searches**: Remove searches you no longer need to keep the list manageable
- **Review Regularly**: Periodically check your saved searches and update or delete outdated ones

### Maximizing Efficiency
- **Save Common Patterns**: Save searches for your regular tasks
- **Use Multiple Searches**: Create different searches for different contexts
- **Leverage Usage Tracking**: The most used searches appear higher in the list

## Frequently Asked Questions (FAQ)

### Q: Can I share my saved searches with others?
**A**: Not currently. Each user's saved searches are private. This feature may be added in the future.

### Q: How many searches can I save?
**A**: There's no hard limit, but we recommend keeping it under 20 for easier management.

### Q: What happens if I delete a default search?
**A**: If you delete your default search, you won't have a default anymore. You can set a new default by clicking the star icon on another search.

### Q: Can I export my saved searches?
**A**: Not currently. This feature may be added in the future.

### Q: Do saved searches work on mobile devices?
**A**: Yes! The interface is fully responsive and works on all devices.

### Q: Will my saved searches sync across devices?
**A**: Yes! Saved searches are stored on the server, so they'll be available on any device where you log in.

### Q: Can I edit the filters of a saved search?
**A**: You can edit the name, but to change filters, it's easier to create a new search with the updated filters and delete the old one.

### Q: What happens if a program or department I saved is deleted?
**A**: The search will still work, but that specific filter will be ignored. You might want to update or delete the search in this case.

## Troubleshooting

### Problem: I don't see the "Saved" button
**Solution**: Make sure you're logged in. The saved searches feature requires authentication.

### Problem: My saved search doesn't show any results
**Possible Causes**:
1. The filters are too restrictive (no projects match)
2. Projects matching your criteria were deleted
3. Your permissions changed and you no longer have access to certain projects

**Solution**: Try loading the search and then adjusting the filters manually.

### Problem: The filters don't apply when I load a search
**Solution**: 
1. Refresh the page and try again
2. Clear your browser cache
3. If the problem persists, contact support

### Problem: I can't delete a saved search
**Solution**: Make sure you have permission to delete it (you can only delete your own searches). If the problem persists, contact support.

## Getting Help

If you encounter any issues or have questions not covered in this guide:

1. **Check the Browser Console**: Open developer tools (F12) and check for error messages
2. **Contact Support**: Report the issue with details about what you were trying to do
3. **Check Documentation**: Review the technical documentation for more details

## Feature Updates

This feature is actively maintained. Check back for updates and new capabilities:

- ✅ Save filter combinations
- ✅ Load saved searches
- ✅ Edit search names
- ✅ Delete searches
- ✅ Set default search
- ✅ Usage tracking
- 🔜 Share searches with team members (planned)
- 🔜 Search templates (planned)
- 🔜 Export/import searches (planned)

---

**Last Updated**: January 7, 2026
**Version**: 1.0
