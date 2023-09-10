import { API_KEY_EMAILABLE } from '@env';

export const verifyEmail = async (email) => {

   if(!email) {
      return ({ isValid: false, message: 'Please provide a valid email address.' })
   }

   try {
      const { deliverability_score } = await 
         fetch(`https://api.emailable.com/v1/verify?email=${email}&api_key=${API_KEY_EMAILABLE}`)
            .then(response => response.json())
            .then(data => ({ deliverability_score: data.score }))
            .catch(error => { throw error })

      if(deliverability_score > 0 && deliverability_score) {
         return ({ isValid: true })
      } else {
         return ({ isValid: false, message: 'Please provide a valid email address.' })
      }

   } catch(error) { return error }

};