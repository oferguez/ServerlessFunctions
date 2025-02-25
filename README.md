# Deployment Status

[![Netlify Status](https://api.netlify.com/api/v1/badges/7bbd95ea-f6e9-4b46-a793-f79e817f5214/deploy-status)](https://app.netlify.com/sites/oferguez/deploys)


# Deployment Configuration

https://app.netlify.com/sites/oferguez/configuration/general

# Sample usage 

https://oferguez.netlify.app/.netlify/functions/getTime

https://oferguez.netlify.app/.netlify/functions/shuffle-words?words=apple,banana,cherry,date,watermelon,blackberries,kiwi,orange

POST https://oferguez.netlify.app/.netlify/functions/ai-translation-fetcher
body:
{
    "words": ["תפוח", "תפוז"],
    "targetLanguage": "English"
}
