/**
 * Remove Duplicate Form Sections - June 20, 2026
 * Hides original form fields to show only clean injected versions
 */

(function() {
  'use strict';

  console.log('🧹 Removing duplicate form sections...');

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      removeDuplicateFormSections();
    }, 1000);
  });

  function removeDuplicateFormSections() {
    console.log('🔍 Scanning for duplicate form sections...');

    // Find all divs and cards in the form
    const formElements = document.querySelectorAll('form > div, form > .card, [role="form"] > div, [role="form"] > .card');

    let removedCount = 0;

    formElements.forEach((element) => {
      const text = element.innerText || element.textContent || '';

      // Hide original Specializations section
      if (text.includes('Specializations') && text.includes('select all that apply') && !element.id.includes('counselor-form')) {
        console.log('❌ Hiding duplicate Specializations section');
        element.style.display = 'none';
        removedCount++;
        return;
      }

      // Hide original Languages section
      if (text.includes('Languages') && text.includes('conduct sessions in') && !element.id.includes('counselor-form')) {
        console.log('❌ Hiding duplicate Languages section');
        element.style.display = 'none';
        removedCount++;
        return;
      }

      // Hide "Select at least one" labels
      if (text.includes('Select at least one') && !element.id.includes('counselor-form')) {
        console.log('❌ Hiding "Select at least one" section');
        element.style.display = 'none';
        removedCount++;
        return;
      }

      // Hide original professional details that have old format buttons
      const buttons = element.querySelectorAll('button[type="button"]');
      const hasCheckboxButtons = Array.from(buttons).some(btn =>
        btn.textContent.includes('✓') || btn.classList.contains('rounded-full')
      );

      if (hasCheckboxButtons && !element.id.includes('counselor-form')) {
        // This is likely the old format with button-style checkboxes
        const headerText = element.querySelector('h2, h3');
        if (headerText && (headerText.textContent.includes('Specializations') || headerText.textContent.includes('Languages'))) {
          console.log('❌ Hiding old format section:', headerText.textContent);
          element.style.display = 'none';
          removedCount++;
          return;
        }
      }
    });

    console.log(`✓ Removed ${removedCount} duplicate sections`);

    // Additional cleanup - hide old form sections by searching for specific patterns
    const allDivs = document.querySelectorAll('form div, [role="form"] div');
    allDivs.forEach((div) => {
      const text = div.textContent || '';

      // Remove divs that have the old checkbox-style buttons for specializations/languages
      if ((text.includes('Specializations') || text.includes('Languages')) &&
          div.querySelector('button.rounded-full, button[class*="border-2"]') &&
          !div.id.includes('counselor-form')) {
        div.style.display = 'none';
      }
    });

    // Hide any inputs/selects that are duplicates (outside our injected form)
    const specializationsInputs = document.querySelectorAll('input[name="specialization_ids"], select[name="specialization_ids"]');
    const languagesInputs = document.querySelectorAll('input[name="language_ids"], select[name="language_ids"]');

    specializationsInputs.forEach((input, index) => {
      if (index > 0) { // Keep first, hide others
        input.parentElement.style.display = 'none';
      }
    });

    languagesInputs.forEach((input, index) => {
      if (index > 0) { // Keep first, hide others
        input.parentElement.style.display = 'none';
      }
    });

    console.log('✓ Form cleanup complete - showing only clean injected sections');
  }

  window.RemoveDuplicates = {
    removeDuplicateFormSections,
  };

  console.log('✓ Duplicate Remover Module Ready');
})();
