import express from 'express'
import crypto from 'crypto'
import Firestore from '../utils/Database'
import { encrypt, decrypt } from '../utils/Encryption'

export const PaymentsRouter = express.Router()

require('dotenv')

const { 
  basePrice, internalDiscountAmount, txnFee, taxRate 
} = require('../../assets/config.json').tickets

PaymentsRouter.post('/create', (req, res)=>{ 
  const { user } = req.body
  const transaction = {
    baseAmount: undefined,
    discountPercentApplied: undefined,
    taxPercent: undefined,
    amountPaid: undefined,
    status: 'PENDING'
  }
  
  Firestore.collection('Tickets').where('email', '==', user.email)
    .get()
    .then(async (searchResults)=>{
      if(searchResults.docs.length!==0) 
        throw new Error("User Already Exists")
      
      transaction.baseAmount = basePrice

      if(user.isInternalStudent && user.studentIdNumber!==undefined && user.studentIdNumber!=='')
        transaction.baseAmount = internalDiscountAmount
        
      const query = await Firestore.collection('Coupons').where('couponCode', '==', user.couponCode).limit(1).get()      
      
      if(query.docs!==undefined && query.docs.length > 0) {
        const coupon = query.docs[0].data()

        if(coupon!==undefined && coupon!==null) {
          if(coupon.maxUses!==0) {
            transaction.discountPercentApplied = coupon.discount
            Firestore.collection('Coupons').doc(query.docs[0].id).update({ maxUses: (coupon.maxUses - 1)  })
          }
          else
            transaction.discountPercentApplied = 0
        }
        else
          transaction.discountPercentApplied = 0  
      }
      else
        transaction.discountPercentApplied = 0

      transaction.taxPercent = taxRate * 100

      // CRUCIAL --------------------------------
      transaction.amountPaid = Math.ceil((transaction.baseAmount * (1 + (txnFee * (1 + taxRate)))) * (1 - transaction.discountPercentApplied/100))
      // ========================================

      Firestore.collection('Mailing List').add({ name: user.name, email: user.email })

      Firestore.collection('Transactions').add(transaction).then((doc)=>{
        transaction['txnid'] = doc.id
        res.send({
          transaction,
          encoding: 'hex',
          apiKey: encrypt(process.env.PAYU_KEY),
          salt: encrypt(process.env.PAYU_SALT),
          checksum: crypto.createHash('sha512').update(JSON.stringify(transaction)).digest("base64")
        })
      })
    }).catch((err)=>{
      console.error(err)
      res.status(403).send(err)
    })
})

PaymentsRouter.post('/verify', (req, res)=>{
  // Webhook from PayU
  /**
   * @todo
   * Find ticket by TxnID and set
   *  verified: true
   * 
   * If status is failed, send email to User and Admin
   */
})
