import React, { useState } from 'react'
import { Plus, Trash2, Phone, Mail, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function TrustedContacts() {
  const { state, actions } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: ''
  })

  const handleAddContact = () => {
    if (!newContact.name || (!newContact.phone && !newContact.email)) {
      actions.showModal({
        type: 'error',
        title: 'Invalid Contact',
        content: 'Please provide a name and at least one contact method (phone or email).'
      })
      return
    }

    const updatedContacts = [...state.user.trustedContacts, {
      id: Date.now(),
      ...newContact
    }]

    actions.updateTrustedContacts(updatedContacts)
    setNewContact({ name: '', phone: '', email: '', relationship: '' })
    setIsAdding(false)
  }

  const handleRemoveContact = (contactId) => {
    const updatedContacts = state.user.trustedContacts.filter(
      contact => contact.id !== contactId
    )
    actions.updateTrustedContacts(updatedContacts)
  }

  const handleTestAlert = async (contact) => {
    actions.showModal({
      type: 'info',
      title: 'Test Alert',
      content: `Test alert would be sent to ${contact.name} at ${contact.phone || contact.email}`
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading">Trusted Contacts</h2>
          <p className="text-body">
            These contacts will be notified during emergency situations
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Add Contact Form */}
      {isAdding && (
        <div className="card border-2 border-primary/20">
          <h3 className="font-bold text-text mb-4">Add New Contact</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Name *
              </label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Relationship
              </label>
              <select
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select relationship</option>
                <option value="family">Family Member</option>
                <option value="friend">Friend</option>
                <option value="lawyer">Lawyer</option>
                <option value="colleague">Colleague</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddContact}
                className="btn-primary flex-1"
              >
                Add Contact
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewContact({ name: '', phone: '', email: '', relationship: '' })
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-4">
        {state.user.trustedContacts.length === 0 ? (
          <div className="card text-center py-8">
            <User className="w-12 h-12 text-secondaryText mx-auto mb-4" />
            <h3 className="font-bold text-text mb-2">No Trusted Contacts</h3>
            <p className="text-body mb-4">
              Add trusted contacts who will be notified during emergencies
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="btn-primary"
            >
              Add Your First Contact
            </button>
          </div>
        ) : (
          state.user.trustedContacts.map((contact) => (
            <div key={contact.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-text">{contact.name}</h3>
                    {contact.relationship && (
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-secondaryText">
                        {contact.relationship}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {contact.phone && (
                      <div className="flex items-center space-x-2 text-sm text-secondaryText">
                        <Phone className="w-4 h-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center space-x-2 text-sm text-secondaryText">
                        <Mail className="w-4 h-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestAlert(contact)}
                    className="px-3 py-1 text-sm bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Emergency Alert Test */}
      {state.user.trustedContacts.length > 0 && (
        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-red-800">Emergency Alert System</h3>
              <p className="text-sm text-red-600">
                Test your emergency alert system to ensure it works when needed
              </p>
            </div>
            <button
              onClick={actions.sendEmergencyAlert}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Send Test Alert
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
