import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useMutation } from '@apollo/react-hooks';

import {
  View,
  Card,
  Form,
  TextInput,
  TextArea,
  Button,
  Text,
  Alert,
} from '../../core-ui';
import { Background, SuccessFeedback } from '../../components';
import { useAuth } from '../../context';
import { validateEmail, useViewport } from '../../helpers';
import { CONTACT_US } from '../../graphql/queries/server/contact';
import { ContactUs, ContactUsVariables } from '../../generated/ContactUs';
import { GRAY_TEXT, WHITE } from '../../constants/colors';
import SvgInsembleBullet from '../../components/icons/insemble-bullet';
import { FONT_SIZE_SEMI_MEDIUM, FONT_SIZE_XLARGE } from '../../constants/theme';

const BENEFITS = [
  'Access the performance of\nmillions of retailers instantly',
  'Find answers on where to focus\nand optimize your business',
  'Track and share updated reports\non the latest in the market',
];
export default function ContactUsScene() {
  let { register, handleSubmit, errors, getValues } = useForm();
  let { isAuthenticated, user } = useAuth();
  let { isDesktop } = useViewport();
  let [contactUs, { loading, data, error }] = useMutation<
    ContactUs,
    ContactUsVariables
  >(CONTACT_US, {
    onCompleted: () => {
      setHasSubmitted(true);
    },
  });
  let [hasSubmitted, setHasSubmitted] = useState(false);

  let inputContainerStyle = { paddingTop: 12, paddingBottom: 12 };

  let onSubmit = (fieldValues: FieldValues) => {
    if (Object.keys(errors).length === 0) {
      let { firstName, lastName, company, email, message } = fieldValues;
      let contactvariables = isAuthenticated
        ? {
            msg: message,
          }
        : {
            firstName,
            lastName,
            company,
            email,
            msg: message,
          };
      contactUs({
        variables: contactvariables,
      });
    }
  };

  return (
    <Background mode="withBubble">
      <Container>
        {hasSubmitted ? (
          <SuccessFeedback>
            <Text fontSize={FONT_SIZE_XLARGE} color={GRAY_TEXT}>
              We’ll get back to you as soon as we can at
            </Text>
            <Text fontSize={FONT_SIZE_XLARGE} color={GRAY_TEXT}>
              {user?.email || getValues('email')}
            </Text>
          </SuccessFeedback>
        ) : (
          <>
            {!isAuthenticated && (
              <TitleContainer>
                <Title>Contact our sales team</Title>
                <Description>
                  We’d love to answer your sales questions. Fill out the {'\n'}{' '}
                  form and we’ll get back to you as soon as possible.
                </Description>
              </TitleContainer>
            )}

            <RowedView>
              <CardContainer title="Contact Us">
                <Content onSubmit={handleSubmit(onSubmit)}>
                  {data ? (
                    <Text>
                      Your message has been received. We will get back to you
                      soon.
                    </Text>
                  ) : (
                    <>
                      <Alert
                        visible={!!error?.message}
                        text={error?.message || ''}
                      />
                      {!isAuthenticated && (
                        <>
                          <TextInput
                            name="email"
                            ref={register({
                              required: 'Email should not be empty',
                              validate: (val) =>
                                validateEmail(val) || 'Incorrect email format',
                            })}
                            label="Email Address"
                            placeholder="Your Email Address"
                            {...(errors?.email?.message && {
                              errorMessage: errors.email.message,
                            })}
                            containerStyle={inputContainerStyle}
                          />
                          <RowedView>
                            <View flex style={{ marginRight: 10 }}>
                              <TextInput
                                name="firstName"
                                ref={register({
                                  required: 'First name should not be empty',
                                })}
                                label="First Name"
                                placeholder="Your First Name"
                                {...(errors?.firstName?.message && {
                                  errorMessage: errors.firstName.message,
                                })}
                                containerStyle={inputContainerStyle}
                              />
                            </View>
                            <View flex style={{ marginLeft: 10 }}>
                              <TextInput
                                name="lastName"
                                ref={register({
                                  required: 'Last name should not be empty',
                                })}
                                label="Last Name"
                                placeholder="Your Last Name"
                                {...(errors?.lastName?.message && {
                                  errorMessage: errors.lastName.message,
                                })}
                                containerStyle={inputContainerStyle}
                              />
                            </View>
                          </RowedView>
                          <TextInput
                            name="company"
                            ref={register({
                              required: 'Company name should not be empty',
                            })}
                            label="Company"
                            placeholder="Your Company"
                            {...(errors?.company?.message && {
                              errorMessage: errors.company.message,
                            })}
                            containerStyle={inputContainerStyle}
                          />
                        </>
                      )}
                      <TextArea
                        label="Message"
                        name="message"
                        ref={register({
                          required: 'Message should not be empty',
                        })}
                        {...(errors?.message?.message && {
                          errorMessage: errors.message.message,
                        })}
                        containerStyle={inputContainerStyle}
                      />
                      <SubmitButton
                        text="Submit"
                        type="submit"
                        loading={loading}
                      />
                    </>
                  )}
                </Content>
              </CardContainer>
              {isDesktop && !isAuthenticated && (
                <RightContainer>
                  {BENEFITS.map((benefit) => (
                    <BenefitContainer key={benefit}>
                      <SvgInsembleBullet
                        style={{ color: WHITE, marginRight: 12 }}
                      />
                      <Text color={WHITE} fontSize={FONT_SIZE_SEMI_MEDIUM}>
                        {benefit}
                      </Text>
                    </BenefitContainer>
                  ))}
                </RightContainer>
              )}
            </RowedView>
          </>
        )}
      </Container>
    </Background>
  );
}

const Container = styled(View)`
  padding: 40px;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
`;

const CardContainer = styled(Card)`
  width: 360px;
  min-height: 350px;
`;

const RowedView = styled(View)`
  flex-direction: row;
`;

const Content = styled(Form)`
  padding: 12px 24px;
`;

const SubmitButton = styled(Button)`
  margin: 12px 0;
`;

const Title = styled(Text)`
  font-size: 35px;
  padding-bottom: 4px;
`;

const TitleContainer = styled(View)`
  align-items: center;
  padding-bottom: 20px;
`;

const Description = styled(Text)`
  font-size: 20px;
  color: ${GRAY_TEXT};
`;

const BenefitContainer = styled(RowedView)`
  align-items: center;
  padding: 10px 0;
`;

const RightContainer = styled(View)`
  justify-content: flex-end;
  margin-left: 40px;
  padding-bottom: 80px;
`;
